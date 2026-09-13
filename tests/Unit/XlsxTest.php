<?php

namespace Tests\Unit;

use App\Support\Xlsx;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;
use ZipArchive;

/**
 * The spreadsheet writer, on its own: the package it produces has every part
 * Excel expects, the parts are well-formed XML, and cells come out typed.
 */
class XlsxTest extends TestCase
{
    public function test_it_writes_a_well_formed_package(): void
    {
        $sheet = (new Xlsx('Check'))->widths([8, 20, 14]);
        $sheet->row([['Title', 'title']])->mergeLastRow(3);
        $sheet->row([['#', 'header'], ['Name', 'header'], ['Amount', 'header']])->freezeBelowLastRow();
        $sheet->row([[1, 'int'], ['Juan & María', 'text'], [1234.5, 'number']]);
        $sheet->row([[2, 'intAlt'], [Carbon::create(2026, 9, 1), 'dateAlt'], [null, 'numberAlt']]);
        $sheet->filter(2, 4, 3);

        $path = $sheet->save();

        try {
            $zip = new ZipArchive();
            $this->assertTrue($zip->open($path));

            foreach (['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/worksheets/sheet1.xml'] as $part) {
                $xml = $zip->getFromName($part);
                $this->assertNotFalse($xml, "$part is missing");
                $this->assertNotFalse(@simplexml_load_string($xml), "$part is not well-formed XML");
            }

            $ws = $zip->getFromName('xl/worksheets/sheet1.xml');
            $this->assertStringContainsString('<mergeCell ref="A1:C1"/>', $ws);
            $this->assertStringContainsString('<autoFilter ref="A2:C4"/>', $ws);
            $this->assertStringContainsString('ySplit="2"', $ws);
            // Text is escaped and inline; numbers are bare; a null cell is left out.
            $this->assertStringContainsString('Juan &amp; María', $ws);
            $this->assertStringContainsString('<c r="C3" s="11"><v>1234.5</v></c>', $ws);
            $this->assertStringNotContainsString('r="C4"', $ws);
            // 2026-09-01 is day 46,266 in Excel's count.
            $this->assertStringContainsString('<c r="B4" s="14"><v>46266</v></c>', $ws);
            $zip->close();
        } finally {
            @unlink($path);
        }
    }

    public function test_column_names_and_pixel_widths(): void
    {
        $this->assertSame('A', Xlsx::column(0));
        $this->assertSame('Z', Xlsx::column(25));
        $this->assertSame('AA', Xlsx::column(26));
        $this->assertSame('AZ', Xlsx::column(51));
        $this->assertSame(40, Xlsx::columnPixels(5));
    }
}
