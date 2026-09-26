<?php

namespace Tests\Unit;

use App\Providers\AppServiceProvider;
use Tests\TestCase;

/**
 * A production .env with APP_DEBUG left on turns every unhandled error into
 * a page showing the stack trace, SQL and environment values to whoever
 * triggered it - this has happened to this exact deployment before. The
 * provider forces debug off at runtime when it detects that combination,
 * the same way it already caps a stale .env's session lifetime.
 */
class AppServiceProviderTest extends TestCase
{
    public function test_debug_is_forced_off_in_production_regardless_of_the_env_file(): void
    {
        $originalEnv = $this->app['env'];
        $this->app['env'] = 'production';
        config(['app.debug' => true]);

        try {
            $this->invokeRegister();
            $this->assertFalse(config('app.debug'));
        } finally {
            $this->app['env'] = $originalEnv;
        }
    }

    public function test_debug_is_left_alone_outside_production(): void
    {
        $originalEnv = $this->app['env'];
        $this->app['env'] = 'local';
        config(['app.debug' => true]);

        try {
            $this->invokeRegister();
            $this->assertTrue(config('app.debug'), 'a developer can still turn debug on locally');
        } finally {
            $this->app['env'] = $originalEnv;
        }
    }

    public function test_the_session_cookie_is_forced_secure_in_production_regardless_of_the_env_file(): void
    {
        $originalEnv = $this->app['env'];
        $this->app['env'] = 'production';
        config(['session.secure' => false]);

        try {
            $this->invokeRegister();
            $this->assertTrue(config('session.secure'));
        } finally {
            $this->app['env'] = $originalEnv;
        }
    }

    public function test_the_session_cookie_setting_is_left_alone_outside_production(): void
    {
        $originalEnv = $this->app['env'];
        $this->app['env'] = 'local';
        config(['session.secure' => false]);

        try {
            $this->invokeRegister();
            $this->assertFalse(config('session.secure'), 'plain HTTP local development is not forced onto HTTPS');
        } finally {
            $this->app['env'] = $originalEnv;
        }
    }

    private function invokeRegister(): void
    {
        $provider = new AppServiceProvider($this->app);
        (new \ReflectionMethod($provider, 'register'))->invoke($provider);
    }
}
