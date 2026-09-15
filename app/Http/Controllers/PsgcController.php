<?php

namespace App\Http\Controllers;

use App\Support\PhilippineAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The address pickers' reference list: every province, and each level under
 * the one chosen above it.
 *
 * Only a code and a name go out - this is a published government list, not
 * anyone's data, and nothing else about the rows is any of the browser's
 * business. The lists are cached and change about once a year, so they carry
 * a long cache life and are read straight from the browser's cache on the
 * second and later visits to the form.
 */
class PsgcController extends Controller
{
    /** How long a browser may keep a list. A day, matching the server-side cache. */
    private const MAX_AGE = 86400;

    /** Every province in the country: the address form starts here. */
    public function provinceIndex(): JsonResponse
    {
        return $this->cached(PhilippineAddress::allProvinces());
    }

    public function cities(Request $request, string $province): JsonResponse
    {
        $this->assertCode($province);

        return $this->cached(PhilippineAddress::citiesOf($province));
    }

    public function barangays(Request $request, string $city): JsonResponse
    {
        $this->assertCode($city);

        return $this->cached(PhilippineAddress::barangaysOf($city));
    }

    /** PSGC codes are nine digits. Anything else never reaches a query. */
    private function assertCode(string $code): void
    {
        abort_unless(preg_match('/^\d{9}$/', $code) === 1, 404);
    }

    private function cached(array $rows): JsonResponse
    {
        return response()
            ->json(['data' => $rows])
            ->header('Cache-Control', 'private, max-age=' . self::MAX_AGE);
    }
}
