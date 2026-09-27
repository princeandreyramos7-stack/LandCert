<?php

namespace Tests\Feature;

use App\Models\Notification as NotificationModel;
use App\Models\User;
use App\Notifications\PushNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use NotificationChannels\WebPush\PushSubscription;
use Tests\TestCase;

/**
 * Push is a bonus third channel alongside the existing email/SMS: applicant
 * accounts only, opted in per device from the Profile page (see
 * PushNotificationToggle.jsx), riding on the same choke point every in-app
 * notification already goes through (App\Models\Notification::createForUser).
 */
class PushNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscribing_stores_a_push_subscription_for_the_signed_in_user(): void
    {
        $user = User::factory()->create(['user_type' => 'applicant']);

        $this->actingAs($user)
            ->postJson('/push-subscriptions', [
                'endpoint' => 'https://push.example.com/abc123',
                'keys' => ['p256dh' => 'fake-p256dh-key', 'auth' => 'fake-auth-secret'],
            ])
            ->assertOk()
            ->assertJson(['status' => 'subscribed']);

        $this->assertDatabaseHas('push_subscriptions', [
            'subscribable_id' => $user->id,
            'subscribable_type' => $user->getMorphClass(),
            'endpoint' => 'https://push.example.com/abc123',
        ]);
    }

    public function test_unsubscribing_removes_the_stored_subscription(): void
    {
        $user = User::factory()->create(['user_type' => 'applicant']);
        $user->updatePushSubscription('https://push.example.com/abc123', 'key', 'auth');

        $this->actingAs($user)
            ->deleteJson('/push-subscriptions', ['endpoint' => 'https://push.example.com/abc123'])
            ->assertOk()
            ->assertJson(['status' => 'unsubscribed']);

        $this->assertDatabaseMissing('push_subscriptions', [
            'subscribable_id' => $user->id,
            'endpoint' => 'https://push.example.com/abc123',
        ]);
    }

    public function test_a_subscribed_applicant_is_sent_a_push_alongside_their_in_app_notification(): void
    {
        NotificationFacade::fake();

        $applicant = User::factory()->create(['user_type' => 'applicant']);
        $applicant->updatePushSubscription('https://push.example.com/abc123', 'key', 'auth');

        NotificationModel::createForUser($applicant->id, 'application_approved', 'Approved', 'Your application was approved.', '/my-applications');

        NotificationFacade::assertSentTo($applicant, PushNotification::class);
    }

    public function test_an_applicant_with_no_subscription_gets_no_push(): void
    {
        NotificationFacade::fake();

        $applicant = User::factory()->create(['user_type' => 'applicant']);

        NotificationModel::createForUser($applicant->id, 'application_approved', 'Approved', 'Your application was approved.', '/my-applications');

        NotificationFacade::assertNothingSent();
    }

    public function test_staff_are_never_sent_a_push_even_when_subscribed(): void
    {
        NotificationFacade::fake();

        $admin = User::factory()->create(['user_type' => 'admin']);
        $admin->updatePushSubscription('https://push.example.com/staff', 'key', 'auth');

        NotificationModel::createForUser($admin->id, 'new_application', 'New Application', 'A new application was submitted.', '/admin/requests/1');

        NotificationFacade::assertNothingSent();
    }
}
