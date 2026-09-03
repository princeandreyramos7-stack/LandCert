<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Requires the domain half of an email address to be entirely lowercase, while
 * leaving the name half alone.
 *
 * "JuanDelaCruz@gmail.com" is fine — mail systems treat the local part as the
 * mailbox owner's to capitalise however they like. "juan@YAHOO.COM" is not:
 * domains are case-insensitive by definition, so an upper-case one is a typo
 * rather than a different address, and letting it through would put two
 * spellings of the same domain into the records.
 */
class LowercaseEmailDomain implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            return;
        }

        $atPosition = mb_strrpos($value, '@');

        // No "@" at all is not this rule's problem — the `email` rule reports it.
        if ($atPosition === false) {
            return;
        }

        $domain = mb_substr($value, $atPosition + 1);

        if ($domain !== mb_strtolower($domain)) {
            $fail('The domain part of the :attribute must be lowercase (for example, use "gmail.com" rather than "GMAIL.COM").');
        }
    }
}
