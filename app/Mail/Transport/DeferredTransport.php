<?php

namespace App\Mail\Transport;

use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mime\RawMessage;

/**
 * Sends mail after the response has gone out.
 *
 * Every notification here is sent inline, from the controller, and a mail
 * server is slow: connecting to Gmail and logging in takes four or five
 * seconds whether it works or not, and the applicant sat through it after
 * pressing Submit, as did the officer after every status change. Meanwhile
 * the web server thread was held for those seconds, which under load is the
 * difference between five submissions a second and forty.
 *
 * This transport wraps the real one and hands the send to the application's
 * terminating phase, which runs once the response has been flushed to the
 * browser. Nothing else changes: the same mailables, the same addresses, the
 * same transport underneath, and a failure is logged rather than lost.
 * Outside a web request - a console command, the scheduler, the test suite -
 * there is nobody waiting, so the mail is simply sent.
 */
class DeferredTransport implements TransportInterface
{
    /** $defer false sends straight away: a console command has nobody waiting. */
    public function __construct(private TransportInterface $inner, private bool $defer = true)
    {
    }

    public function send(RawMessage $message, ?Envelope $envelope = null): ?SentMessage
    {
        if (!$this->defer) {
            return $this->inner->send($message, $envelope);
        }

        app()->terminating(function () use ($message, $envelope) {
            try {
                $this->inner->send($message, $envelope);
            } catch (\Throwable $e) {
                Log::error('Deferred mail was not sent: ' . $e->getMessage());
            }
        });

        return null;
    }

    public function __toString(): string
    {
        return 'deferred(' . $this->inner . ')';
    }
}
