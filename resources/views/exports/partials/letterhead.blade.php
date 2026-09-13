{{--
    The office letterhead every downloaded PDF opens with: the city seal on
    the left, the Ilagan 2030 mark on the right, the office's lines between
    them - the same arrangement as the printed documents and the Excel
    downloads.

    A fixed-width table centred on the page, so the logos sit beside the
    text rather than out at the page edges - DomPDF has no flexbox, and a
    full-width table would push them apart on a landscape sheet. Inline
    styles, so the block looks the same whatever stylesheet the host
    template carries.
--}}
@php
    $seal = \App\Support\ReportLogos::seal();
    $mark = \App\Support\ReportLogos::mark();
@endphp
<div style="border-bottom: 2px solid #0d1f5c; padding-bottom: 6px; margin-bottom: 10px;">
    <table style="width: 420px; margin: 0 auto; border-collapse: collapse; border: 0; background: transparent;">
        <tr>
            <td style="width: 64px; text-align: right; vertical-align: middle; padding: 0 8px 0 0; border: 0; background: transparent;">
                @if ($seal)<img src="{{ $seal }}" alt="" style="width: 54px; height: 54px;">@endif
            </td>
            <td style="text-align: center; vertical-align: middle; font-family: Arial, sans-serif; line-height: 1.25; border: 0; background: transparent;">
                <div style="font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: #555;">Republic of the Philippines</div>
                <div style="font-size: 13px; font-weight: bold; color: #0d1f5c; margin: 1px 0;">City of Ilagan, Isabela</div>
                <div style="font-size: 9px; font-weight: bold; color: #d4a017; text-transform: uppercase;">City Planning &amp; Development Office</div>
            </td>
            <td style="width: 64px; text-align: left; vertical-align: middle; padding: 0 0 0 8px; border: 0; background: transparent;">
                @if ($mark)<img src="{{ $mark }}" alt="" style="width: 54px; height: 54px;">@endif
            </td>
        </tr>
    </table>
</div>
