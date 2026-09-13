<?php

return [

    // No server-side rendering here: the pages are drawn in the browser.
    'ssr' => [
        'enabled' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | History encryption
    |--------------------------------------------------------------------------
    |
    | Inertia keeps each visited page's props in the browser's history so Back
    | and Forward can redraw it without a request. Left in the clear, that let
    | Back after a logout redraw the dashboard from what the history remembered
    | of it. Encrypted, and with the key thrown away whenever a signed-out page
    | is served (HandleInertiaRequests), those entries become unreadable and
    | Back asks the server instead - which sends a signed-out visitor to the
    | login page, and a signed-in one away from it.
    |
    */

    'history' => [
        'encrypt' => (bool) env('INERTIA_ENCRYPT_HISTORY', true),
    ],

];
