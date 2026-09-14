<?php

namespace App\Support;

use App\Models\Psgc\Barangay;
use App\Models\Psgc\CityMunicipality;
use App\Models\Psgc\Province;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Facades\Cache;

/**
 * An address picked from the PSGC: the rules that accept it, the check that
 * it is a real place, and the one line it is written as.
 *
 * A form sends five fields per address - four codes and the street - named
 * after the column the composed line is stored in, so the applicant's address
 * arrives as applicant_address_region_code ... applicant_address_street.
 *
 * The codes are checked here rather than taken on trust. The browser only
 * ever offers valid combinations, but the browser is not what decides: a
 * request can be made by hand with a barangay from one province and a city
 * from another, and free-text addresses are exactly what this replaced.
 *
 * The line itself is always composed on the server from the codes. The
 * client's own copy is never stored, so what is printed on the certificate
 * cannot disagree with what was selected.
 */
class PhilippineAddress
{
    /** The five fields that make up one address, in cascade order. */
    public const PARTS = ['region_code', 'province_code', 'city_code', 'barangay_code', 'street'];

    /** Validation rules for one address, keyed by full field name. */
    public static function rules(string $prefix, bool $required = true): array
    {
        $req = $required ? 'required' : 'nullable';

        return [
            "{$prefix}_region_code" => [$req, 'string', 'size:9', 'exists:psgc_regions,code'],
            "{$prefix}_province_code" => [$req, 'string', 'size:9', 'exists:psgc_provinces,code'],
            "{$prefix}_city_code" => [$req, 'string', 'size:9', 'exists:psgc_cities_municipalities,code'],
            "{$prefix}_barangay_code" => [$req, 'string', 'size:9', 'exists:psgc_barangays,code'],
            "{$prefix}_street" => [$req, 'string', 'max:255'],
        ];
    }

    /** Friendly names, so an error reads "barangay" and not "applicant_address_barangay_code". */
    public static function attributes(string $prefix, string $label): array
    {
        return [
            "{$prefix}_region_code" => "{$label} region",
            "{$prefix}_province_code" => "{$label} province",
            "{$prefix}_city_code" => "{$label} city or municipality",
            "{$prefix}_barangay_code" => "{$label} barangay",
            "{$prefix}_street" => "{$label} street / house no.",
        ];
    }

    /**
     * Each selection must sit under the one before it. Attach from a
     * controller's validator so the message lands on the offending field.
     */
    public static function checkChain(Validator $validator, string $prefix, string $label = 'address'): void
    {
        $input = $validator->getData();
        $get = fn (string $part) => $input["{$prefix}_{$part}"] ?? null;

        // Nothing to check until the codes are there and well-formed; the
        // rules above have already said so in that case.
        if (!$get('region_code') || !$get('province_code') || !$get('city_code') || !$get('barangay_code')) {
            return;
        }

        $province = Province::find($get('province_code'));
        if (!$province || $province->region_code !== $get('region_code')) {
            $validator->errors()->add("{$prefix}_province_code", "That province is not in the selected region.");

            return;
        }

        $city = CityMunicipality::find($get('city_code'));
        if (!$city || $city->province_code !== $province->code) {
            $validator->errors()->add("{$prefix}_city_code", "That city or municipality is not in the selected province.");

            return;
        }

        $barangay = Barangay::find($get('barangay_code'));
        if (!$barangay || $barangay->city_code !== $city->code) {
            $validator->errors()->add("{$prefix}_barangay_code", "That barangay is not in the selected city or municipality.");
        }
    }

    /**
     * The address as one line, built from the codes, plus the codes
     * themselves for storing. Null when the address was not filled in.
     *
     * @return array{line: string, region_code: string, province_code: string, city_code: string, barangay_code: string, street: string}|null
     */
    public static function resolve(array $input, string $prefix): ?array
    {
        $get = fn (string $part) => $input["{$prefix}_{$part}"] ?? null;

        if (!$get('barangay_code') || !$get('city_code')) {
            return null;
        }

        $barangay = Barangay::find($get('barangay_code'));
        $city = CityMunicipality::with('province.region')->find($get('city_code'));

        if (!$barangay || !$city) {
            return null;
        }

        $province = $city->province;
        $street = trim((string) $get('street'));

        // "123 Rizal St., Alibagu, City of Ilagan, Isabela" - the order the
        // form is printed in. A district or a stand-alone city is dropped
        // from the line: "City of Manila, First District, NCR" is not how
        // anyone writes their address.
        $parts = [
            $street !== '' ? $street : null,
            $barangay->name,
            $city->name,
            $province && $province->kind === 'province' ? $province->name : optional($province?->region)->name,
        ];

        return [
            'line' => implode(', ', array_filter($parts)),
            'region_code' => $get('region_code'),
            'province_code' => $province?->code,
            'city_code' => $city->code,
            'barangay_code' => $barangay->code,
            'street' => $street !== '' ? $street : null,
        ];
    }

    /**
     * The columns to write on applicants / representatives: the composed line
     * under its own column name, and the parts it was built from.
     */
    public static function columns(?array $resolved, string $addressColumn): array
    {
        if (!$resolved) {
            return [];
        }

        return [
            $addressColumn => $resolved['line'],
            'address_region_code' => $resolved['region_code'],
            'address_province_code' => $resolved['province_code'],
            'address_city_code' => $resolved['city_code'],
            'address_barangay_code' => $resolved['barangay_code'],
            'address_street' => $resolved['street'],
        ];
    }

    /**
     * The whole country as one nested list, for the pickers.
     *
     * Cached: it is 42,000 barangays that change perhaps once a year, and
     * rebuilding it per request would be the slowest thing on the form.
     */
    public static function regions(): array
    {
        return Cache::remember('psgc.regions', now()->addDay(), fn () => \App\Models\Psgc\Region::orderBy('name')
            ->get(['code', 'name', 'short_name'])
            ->map(fn ($r) => ['code' => $r->code, 'name' => $r->name, 'short_name' => $r->short_name])
            ->all());
    }

    public static function provincesOf(string $regionCode): array
    {
        return Cache::remember("psgc.provinces.{$regionCode}", now()->addDay(), fn () => Province::where('region_code', $regionCode)
            ->orderBy('name')
            ->get(['code', 'name', 'kind'])
            ->map(fn ($p) => ['code' => $p->code, 'name' => $p->name, 'kind' => $p->kind])
            ->all());
    }

    public static function citiesOf(string $provinceCode): array
    {
        return Cache::remember("psgc.cities.{$provinceCode}", now()->addDay(), fn () => CityMunicipality::where('province_code', $provinceCode)
            ->orderBy('name')
            ->get(['code', 'name', 'is_city'])
            ->map(fn ($c) => ['code' => $c->code, 'name' => $c->name, 'is_city' => $c->is_city])
            ->all());
    }

    public static function barangaysOf(string $cityCode): array
    {
        return Cache::remember("psgc.barangays.{$cityCode}", now()->addDay(), fn () => Barangay::where('city_code', $cityCode)
            ->orderBy('name')
            ->get(['code', 'name'])
            ->map(fn ($b) => ['code' => $b->code, 'name' => $b->name])
            ->all());
    }
}
