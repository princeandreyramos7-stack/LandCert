<?php

namespace Tests\Feature;

use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Scans and receipts are streamed to the browser with a short private cache
 * life and an ETag, outside the group's request throttle - the report shows
 * each one several times over, and the pages of the site stay uncached.
 */
class StoredFilesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_a_requirement_scan_is_served_with_a_private_cache_life_and_an_etag(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved', $officer);
        $doc = $this->requirementScan($app, 13, 'Title');

        $first = $this->actingAs($officer)->get("/requirements/{$doc->id}/view");
        $first->assertOk()
            ->assertHeader('content-type', 'image/png')
            ->assertHeader('cache-control', 'max-age=300, private');
        $this->assertNotEmpty($etag = $first->headers->get('etag'));
        $this->assertNotEmpty($first->headers->get('last-modified'));
        $this->assertNull($first->headers->get('pragma'), 'the no-cache middleware must leave a cached file alone');

        // A browser holding a copy is told it is still current, without the bytes.
        $this->actingAs($officer)
            ->withHeaders(['If-None-Match' => $etag])
            ->get("/requirements/{$doc->id}/view")
            ->assertStatus(304);
    }

    public function test_a_receipt_is_served_the_same_way(): void
    {
        $owner = $this->userOf('applicant');
        $app = $this->application($owner, 'CZC', 'approved');
        Storage::disk('local')->put('receipts/r.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));
        $payment = Payment::where('request_id', $app->id)->first();
        $payment->update(['receipt_file_path' => 'receipts/r.png']);

        $this->actingAs($owner)
            ->get("/payments/{$payment->id}/receipt")
            ->assertOk()
            ->assertHeader('cache-control', 'max-age=300, private');
    }

    public function test_pages_are_still_not_cached(): void
    {
        $response = $this->actingAs($this->userOf('applicant'))->get('/my-applications');
        $response->assertOk();
        $this->assertStringContainsString('no-store', $response->headers->get('cache-control'));
    }

    public function test_the_file_routes_sit_outside_the_page_throttle(): void
    {
        $router = app('router');
        foreach (['requirements.view', 'payments.receipt.view'] as $name) {
            $middleware = collect($router->gatherRouteMiddleware($router->getRoutes()->getByName($name)))
                ->map(fn ($m) => is_string($m) ? $m : get_class($m));
            $this->assertTrue($middleware->contains('Illuminate\Routing\Middleware\ThrottleRequests:300,1'), "$name has its own limit");
            $this->assertFalse($middleware->contains('Illuminate\Routing\Middleware\ThrottleRequests:60,1'), "$name is out of the page limit");
        }
    }

    public function test_a_stranger_cannot_read_another_applicants_scan(): void
    {
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved');
        $doc = $this->requirementScan($app, 13, 'Title');

        // The guest first: actingAs() stays in force for the rest of a test.
        $this->get("/requirements/{$doc->id}/view")->assertRedirect('/login');
        $this->actingAs($this->userOf('applicant'))->get("/requirements/{$doc->id}/view")->assertForbidden();
    }
}
