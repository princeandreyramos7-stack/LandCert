<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use RuntimeException;
use ZipArchive;

/**
 * A small Excel (.xlsx) writer for the reports.
 *
 * A CSV cannot carry a bold header, a fill, a column width or a number format,
 * so a report opened from one looks like a data dump whatever order its rows
 * are in. An .xlsx can carry all of those, and it is only a zip of a few XML
 * files - which is what this writes, with the handful of styles the reports
 * need and nothing else. No library, so nothing to install on the host.
 *
 * One sheet. Text is written as inline strings so Excel never "helpfully"
 * turns "September 2026" into a date; dates are written as real Excel dates
 * so they sort and filter as dates; money as numbers with a number format.
 */
class Xlsx
{
    /** Style names, resolved to cellXfs indexes in styles.xml below. */
    private const STYLES = [
        'default'     => 0,
        'title'       => 1,
        'subtitle'    => 2,
        'letterhead'  => 3,
        'city'        => 4,
        'meta'        => 5,
        'label'       => 6,
        'value'       => 7,
        'header'      => 8,
        'text'        => 9,
        'textAlt'     => 10,
        'number'      => 11,
        'numberAlt'   => 12,
        'date'        => 13,
        'dateAlt'     => 14,
        'int'         => 15,
        'intAlt'      => 16,
        'totalLabel'  => 17,
        'totalNumber' => 18,
        'totalBlank'  => 19,
        'note'        => 20,
    ];

    /** @var array<int, string> row XML, in order */
    private array $rows = [];
    private int $rowCount = 0;
    private int $columnCount = 0;
    private array $merges = [];
    private array $widths = [];
    private ?int $freezeBelowRow = null;
    private ?string $autoFilter = null;
    private ?string $printTitles = null;
    /** @var array<int, array{path: string, col: int, row: int, x: int, y: int, w: int, h: int}> */
    private array $images = [];

    public function __construct(private string $sheetName = 'Report')
    {
    }

    /** Column widths in characters, A onwards. */
    public function widths(array $widths): static
    {
        $this->widths = $widths;
        $this->columnCount = max($this->columnCount, count($widths));

        return $this;
    }

    /**
     * Append a row. Each cell is [value, style] or a bare value; a value that
     * is a Carbon/DateTime is written as a date, an int/float as a number,
     * anything else as text. Null leaves the cell out.
     */
    public function row(array $cells, ?float $height = null): static
    {
        $this->rowCount++;
        $r = $this->rowCount;
        $xml = '';

        foreach (array_values($cells) as $i => $cell) {
            [$value, $style] = is_array($cell) ? $cell + [null, 'default'] : [$cell, 'default'];
            if ($value === null) {
                continue;
            }
            $ref = self::column($i) . $r;
            $s = self::STYLES[$style] ?? 0;

            if ($value instanceof \DateTimeInterface) {
                $xml .= sprintf('<c r="%s" s="%d"><v>%s</v></c>', $ref, $s, self::excelDate($value));
            } elseif (is_int($value) || is_float($value)) {
                $xml .= sprintf('<c r="%s" s="%d"><v>%s</v></c>', $ref, $s, self::number($value));
            } else {
                $xml .= sprintf('<c r="%s" s="%d" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>', $ref, $s, self::text((string) $value));
            }
        }

        $this->columnCount = max($this->columnCount, count($cells));
        $attrs = $height ? sprintf(' ht="%s" customHeight="1"', self::number($height)) : '';
        $this->rows[] = sprintf('<row r="%d"%s>%s</row>', $r, $attrs, $xml);

        return $this;
    }

    /** An empty row. */
    public function blank(): static
    {
        return $this->row([]);
    }

    /** Merge the last written row from column A across $columns columns. */
    public function mergeLastRow(int $columns): static
    {
        $this->merges[] = sprintf('A%d:%s%d', $this->rowCount, self::column($columns - 1), $this->rowCount);

        return $this;
    }

    /** Keep the rows up to and including the last written one on screen. */
    public function freezeBelowLastRow(): static
    {
        $this->freezeBelowRow = $this->rowCount;

        return $this;
    }

    /** Put a filter on the table: its header row down to its last row. */
    public function filter(int $headerRow, int $lastRow, int $columns): static
    {
        $this->autoFilter = sprintf('A%d:%s%d', $headerRow, self::column($columns - 1), $lastRow);

        return $this;
    }

    /** Repeat the last written row at the top of every printed page. */
    public function repeatLastRowWhenPrinting(): static
    {
        $this->printTitles = sprintf("'%s'!\$%d:\$%d", str_replace("'", "''", $this->sheetName), $this->rowCount, $this->rowCount);

        return $this;
    }

    public function lastRow(): int
    {
        return $this->rowCount;
    }

    /**
     * A PNG floated over the sheet, its top-left corner $xPx, $yPx pixels into
     * cell ($col, $row) (both zero-based), scaled to $heightPx tall.
     */
    public function image(string $path, int $col, int $row, int $heightPx, int $xPx = 0, int $yPx = 0): static
    {
        [$width, $height] = getimagesize($path) ?: [1, 1];
        $this->images[] = [
            'path' => $path,
            'col' => $col,
            'row' => $row,
            'x' => $xPx,
            'y' => $yPx,
            'w' => (int) round($width * ($heightPx / max(1, $height))),
            'h' => $heightPx,
        ];

        return $this;
    }

    /**
     * A PNG placed $xPx from the sheet's left edge and $yPx into row $row,
     * scaled to $heightPx tall. The x is resolved against the column widths
     * set with widths(), so a picture can sit beside centred text however the
     * columns under it are sized.
     */
    public function imageAt(string $path, int $xPx, int $row, int $yPx, int $heightPx): static
    {
        $col = 0;
        $left = 0;
        foreach ($this->widths as $i => $chars) {
            $width = self::columnPixels((float) $chars);
            if ($left + $width > $xPx) {
                $col = $i;
                break;
            }
            $left += $width;
            $col = $i + 1;
        }

        return $this->image($path, $col, $row, $heightPx, max(0, $xPx - $left), $yPx);
    }

    /** Pixel width Excel gives a column of $chars characters at Calibri 11. */
    public static function columnPixels(float $chars): int
    {
        return (int) round($chars * 7 + 5);
    }

    /** The sheet's width in pixels, from the column widths set with widths(). */
    public function widthPixels(): int
    {
        return array_sum(array_map(fn ($chars) => self::columnPixels((float) $chars), $this->widths));
    }

    /** Write the workbook to a temporary file and return its path. */
    public function save(): string
    {
        $path = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new ZipArchive();
        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Could not create the spreadsheet.');
        }

        $zip->addFromString('[Content_Types].xml', $this->contentTypes());
        $zip->addFromString('_rels/.rels', $this->rootRels());
        $zip->addFromString('docProps/app.xml', $this->appProps());
        $zip->addFromString('docProps/core.xml', $this->coreProps());
        $zip->addFromString('xl/workbook.xml', $this->workbook());
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRels());
        $zip->addFromString('xl/styles.xml', $this->styles());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->sheet());

        if ($this->images) {
            $zip->addFromString('xl/worksheets/_rels/sheet1.xml.rels', $this->sheetRels());
            $zip->addFromString('xl/drawings/drawing1.xml', $this->drawing());
            $zip->addFromString('xl/drawings/_rels/drawing1.xml.rels', $this->drawingRels());
            foreach ($this->images as $i => $image) {
                $zip->addFile($image['path'], 'xl/media/image' . ($i + 1) . '.png');
            }
        }

        $zip->close();

        return $path;
    }

    /* ── Cell helpers ─────────────────────────────────────────────────── */

    /** 0 => A, 25 => Z, 26 => AA. */
    public static function column(int $index): string
    {
        $name = '';
        $index++;
        while ($index > 0) {
            $index--;
            $name = chr(65 + ($index % 26)) . $name;
            $index = intdiv($index, 26);
        }

        return $name;
    }

    private static function text(string $value): string
    {
        // Control characters are not allowed in XML 1.0 at all.
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $value);

        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private static function number(int|float $value): string
    {
        return is_int($value) ? (string) $value : rtrim(rtrim(sprintf('%.10F', $value), '0'), '.');
    }

    /** Days since 1899-12-30, which is how Excel counts a date. */
    private static function excelDate(\DateTimeInterface $value): string
    {
        $date = Carbon::instance($value)->startOfDay();
        $epoch = Carbon::create(1899, 12, 30, 0, 0, 0, $date->getTimezone());

        return (string) intdiv($date->getTimestamp() - $epoch->getTimestamp(), 86400);
    }

    /* ── The parts of the package ─────────────────────────────────────── */

    private function contentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . ($this->images
                ? '<Default Extension="png" ContentType="image/png"/>'
                    . '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
                : '')
            . '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            . '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
            . '</Types>';
    }

    private function rootRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            . '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            . '</Relationships>';
    }

    private function appProps(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
            . '<Application>CPDO Land Use Certification System</Application>'
            . '</Properties>';
    }

    private function coreProps(): string
    {
        $now = gmdate('Y-m-d\TH:i:s\Z');

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            . '<dc:creator>City Planning &amp; Development Office</dc:creator>'
            . "<dcterms:created xsi:type=\"dcterms:W3CDTF\">{$now}</dcterms:created>"
            . "<dcterms:modified xsi:type=\"dcterms:W3CDTF\">{$now}</dcterms:modified>"
            . '</cp:coreProperties>';
    }

    private function workbook(): string
    {
        $name = self::text($this->sheetName);
        $names = '';
        if ($this->printTitles) {
            $names .= '<definedName name="_xlnm.Print_Titles" localSheetId="0">' . self::text($this->printTitles) . '</definedName>';
        }
        if ($this->autoFilter) {
            $names .= '<definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'
                . self::text(sprintf("'%s'!%s", str_replace("'", "''", $this->sheetName), preg_replace('/([A-Z]+)(\d+)/', '$$1$$2', $this->autoFilter)))
                . '</definedName>';
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="15000"/></bookViews>'
            . "<sheets><sheet name=\"{$name}\" sheetId=\"1\" r:id=\"rId1\"/></sheets>"
            . ($names ? "<definedNames>{$names}</definedNames>" : '')
            . '</workbook>';
    }

    private function workbookRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '</Relationships>';
    }

    /**
     * The office's colours: navy 0d1f5c for headings and the header row, gold
     * d4a017 for the subtitle, greys for rules and the zebra stripe.
     */
    private function styles(): string
    {
        $fonts = [
            '<font><sz val="11"/><name val="Calibri"/></font>',                                              // 0 body
            '<font><b/><sz val="11"/><name val="Calibri"/></font>',                                          // 1 bold
            '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>',                  // 2 header
            '<font><b/><sz val="18"/><color rgb="FF0D1F5C"/><name val="Calibri"/></font>',                  // 3 title
            '<font><b/><sz val="13"/><color rgb="FFD4A017"/><name val="Calibri"/></font>',                  // 4 subtitle
            '<font><sz val="9"/><color rgb="FF6B7280"/><name val="Calibri"/></font>',                       // 5 meta
            '<font><b/><sz val="14"/><color rgb="FF0D1F5C"/><name val="Calibri"/></font>',                  // 6 city
            '<font><sz val="10"/><color rgb="FF374151"/><name val="Calibri"/></font>',                      // 7 letterhead
            '<font><b/><sz val="10"/><color rgb="FF0D1F5C"/><name val="Calibri"/></font>',                  // 8 label
            '<font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/></font>',                  // 9 note
        ];
        $fills = [
            '<fill><patternFill patternType="none"/></fill>',
            '<fill><patternFill patternType="gray125"/></fill>',
            '<fill><patternFill patternType="solid"><fgColor rgb="FF0D1F5C"/><bgColor indexed="64"/></patternFill></fill>', // 2 navy
            '<fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill>', // 3 stripe
            '<fill><patternFill patternType="solid"><fgColor rgb="FFFFF8E1"/><bgColor indexed="64"/></patternFill></fill>', // 4 total
        ];
        $thin = '<left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom>';
        $borders = [
            '<border><left/><right/><top/><bottom/><diagonal/></border>',
            "<border>{$thin}<diagonal/></border>",
            '<border><left/><right/><top style="medium"><color rgb="FF0D1F5C"/></top><bottom style="medium"><color rgb="FF0D1F5C"/></bottom><diagonal/></border>',
            '<border><left/><right/><top/><bottom style="medium"><color rgb="FF0D1F5C"/></bottom><diagonal/></border>', // 3 rule under letterhead
        ];

        // font, fill, border, numFmt, horizontal, vertical, wrap
        $xf = fn (int $font, int $fill, int $border, int $numFmt = 0, string $h = '', string $v = 'center', bool $wrap = false) => sprintf(
            '<xf numFmtId="%d" fontId="%d" fillId="%d" borderId="%d" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1" applyAlignment="1"><alignment%s vertical="%s"%s/></xf>',
            $numFmt, $font, $fill, $border, $h ? " horizontal=\"{$h}\"" : '', $v, $wrap ? ' wrapText="1"' : ''
        );
        $xfs = [
            $xf(0, 0, 0),                                   // 0 default
            $xf(3, 0, 0, 0, 'center'),                      // 1 title
            $xf(4, 0, 0, 0, 'center'),                      // 2 subtitle
            $xf(7, 0, 0, 0, 'center'),                      // 3 letterhead
            $xf(6, 0, 0, 0, 'center'),                      // 4 city
            $xf(5, 0, 0, 0, 'center'),                      // 5 meta
            $xf(8, 3, 1, 0, 'left'),                        // 6 label
            $xf(0, 0, 1, 0, 'left'),                        // 7 value
            $xf(2, 2, 1, 0, 'center', 'center', true),      // 8 header
            $xf(0, 0, 1, 0, 'left', 'top', true),           // 9 text
            $xf(0, 3, 1, 0, 'left', 'top', true),           // 10 textAlt
            $xf(0, 0, 1, 164, 'right', 'top'),              // 11 number
            $xf(0, 3, 1, 164, 'right', 'top'),              // 12 numberAlt
            $xf(0, 0, 1, 165, 'center', 'top'),             // 13 date
            $xf(0, 3, 1, 165, 'center', 'top'),             // 14 dateAlt
            $xf(0, 0, 1, 0, 'center', 'top'),               // 15 int
            $xf(0, 3, 1, 0, 'center', 'top'),               // 16 intAlt
            $xf(1, 4, 2, 0, 'left'),                        // 17 totalLabel
            $xf(1, 4, 2, 164, 'right'),                     // 18 totalNumber
            $xf(1, 4, 2, 0, 'left'),                        // 19 totalBlank
            $xf(9, 0, 0, 0, 'left'),                        // 20 note
        ];

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00"/><numFmt numFmtId="165" formatCode="mmmm d, yyyy"/></numFmts>'
            . '<fonts count="' . count($fonts) . '">' . implode('', $fonts) . '</fonts>'
            . '<fills count="' . count($fills) . '">' . implode('', $fills) . '</fills>'
            . '<borders count="' . count($borders) . '">' . implode('', $borders) . '</borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="' . count($xfs) . '">' . implode('', $xfs) . '</cellXfs>'
            . '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            . '</styleSheet>';
    }

    private function sheet(): string
    {
        $lastCol = self::column(max(0, $this->columnCount - 1));
        $dimension = sprintf('A1:%s%d', $lastCol, max(1, $this->rowCount));

        $cols = '';
        foreach ($this->widths as $i => $width) {
            $cols .= sprintf('<col min="%d" max="%d" width="%s" customWidth="1"/>', $i + 1, $i + 1, self::number((float) $width));
        }

        $pane = $this->freezeBelowRow
            ? sprintf('<pane ySplit="%d" topLeftCell="A%d" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>', $this->freezeBelowRow, $this->freezeBelowRow + 1)
            : '';

        $merges = $this->merges
            ? '<mergeCells count="' . count($this->merges) . '">' . implode('', array_map(fn ($m) => "<mergeCell ref=\"{$m}\"/>", $this->merges)) . '</mergeCells>'
            : '';

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'
            . "<dimension ref=\"{$dimension}\"/>"
            . "<sheetViews><sheetView workbookViewId=\"0\" showGridLines=\"0\" tabSelected=\"1\">{$pane}</sheetView></sheetViews>"
            . '<sheetFormatPr defaultRowHeight="15"/>'
            . ($cols ? "<cols>{$cols}</cols>" : '')
            . '<sheetData>' . implode('', $this->rows) . '</sheetData>'
            . ($this->autoFilter ? "<autoFilter ref=\"{$this->autoFilter}\"/>" : '')
            . $merges
            . '<printOptions horizontalCentered="1"/>'
            . '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>'
            . '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>'
            . ($this->images ? '<drawing r:id="rId1"/>' : '')
            . '</worksheet>';
    }

    /* ── Pictures: a drawing part the sheet points at ─────────────────── */

    private function sheetRels(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>'
            . '</Relationships>';
    }

    private function drawingRels(): string
    {
        $rels = '';
        foreach ($this->images as $i => $image) {
            $rels .= sprintf(
                '<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image%d.png"/>',
                $i + 1,
                $i + 1
            );
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . $rels . '</Relationships>';
    }

    /** Each picture anchored to one cell, in EMUs (9525 to the pixel). */
    private function drawing(): string
    {
        $emu = fn (int $px) => $px * 9525;
        $anchors = '';
        foreach ($this->images as $i => $image) {
            $id = $i + 1;
            $anchors .= '<xdr:oneCellAnchor>'
                . sprintf(
                    '<xdr:from><xdr:col>%d</xdr:col><xdr:colOff>%d</xdr:colOff><xdr:row>%d</xdr:row><xdr:rowOff>%d</xdr:rowOff></xdr:from>',
                    $image['col'], $emu($image['x']), $image['row'], $emu($image['y'])
                )
                . sprintf('<xdr:ext cx="%d" cy="%d"/>', $emu($image['w']), $emu($image['h']))
                . '<xdr:pic>'
                . sprintf('<xdr:nvPicPr><xdr:cNvPr id="%d" name="Picture %d"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>', $id + 1, $id)
                . sprintf('<xdr:blipFill><a:blip r:embed="rId%d"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>', $id)
                . sprintf('<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>', $emu($image['w']), $emu($image['h']))
                . '</xdr:pic>'
                . '<xdr:clientData/>'
                . '</xdr:oneCellAnchor>';
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . $anchors
            . '</xdr:wsDr>';
    }
}
