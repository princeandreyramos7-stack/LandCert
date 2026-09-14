<?php

namespace Tests\Unit;

use App\Mail\Transport\DeferredTransport;
use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\RawMessage;
use Tests\TestCase;

/**
 * Mail leaves after the response, not before it - so the person who pressed
 * the button is not kept waiting on the mail server.
 */
class DeferredTransportTest extends TestCase
{
    public function test_the_send_waits_for_the_terminating_phase(): void
    {
        $inner = new class implements TransportInterface {
            public array $sent = [];
            public function send(RawMessage $message, ?Envelope $envelope = null): ?SentMessage { $this->sent[] = $message; return null; }
            public function __toString(): string { return 'spy'; }
        };
        $transport = new DeferredTransport($inner, defer: true);
        $mail = (new Email())->from('a@b.test')->to('c@d.test')->subject('hi')->text('there');

        $transport->send($mail);
        $this->assertSame([], $inner->sent, 'nothing goes out while the response is still being built');

        $this->app->terminate();
        $this->assertCount(1, $inner->sent, 'the mail leaves once the response has');
    }

    public function test_a_mail_server_failure_is_logged_and_stays_out_of_the_response(): void
    {
        $inner = new class implements TransportInterface {
            public function send(RawMessage $message, ?Envelope $envelope = null): ?SentMessage { throw new \RuntimeException('535 authentication failed'); }
            public function __toString(): string { return 'broken'; }
        };
        \Illuminate\Support\Facades\Log::shouldReceive('error')->once()->withArgs(fn ($m) => str_contains($m, '535'));

        (new DeferredTransport($inner, defer: true))->send((new Email())->from('a@b.test')->to('c@d.test')->text('x'));
        $this->app->terminate();
        $this->assertTrue(true);
    }

    public function test_with_nobody_waiting_it_sends_at_once(): void
    {
        $inner = new class implements TransportInterface {
            public int $sent = 0;
            public function send(RawMessage $message, ?Envelope $envelope = null): ?SentMessage { $this->sent++; return null; }
            public function __toString(): string { return 'spy'; }
        };
        (new DeferredTransport($inner, defer: false))->send((new Email())->from('a@b.test')->to('c@d.test')->text('x'));
        $this->assertSame(1, $inner->sent);
    }

    public function test_the_application_s_mailer_is_the_deferred_one(): void
    {
        $this->assertSame('deferred', config('mail.default'));
        $this->assertStringStartsWith('deferred(', (string) \Illuminate\Support\Facades\Mail::mailer()->getSymfonyTransport());
    }
}
