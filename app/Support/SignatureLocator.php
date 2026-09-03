<?php

namespace App\Support;

/**
 * Finds a staff member's e-signature image on disk by their name.
 *
 * The signature a certificate prints comes from users.signature_path, which is
 * set by the signatures:sync command. That leaves the signature dependent on a
 * command having been run against each environment: an account whose path was
 * never set, or points at a file that has since been renamed, prints an unsigned
 * certificate even though the image is sitting right there in public/images.
 *
 * So the path is treated as a cache rather than the only answer. When it is
 * missing or stale the image is located by name instead, which means dropping a
 * correctly-named file into the directory is enough for it to appear.
 *
 * Matching mirrors signatures:sync — letters only, ignoring case, punctuation,
 * honorifics and middle initials — and only an unambiguous match is accepted.
 * Printing someone else's signature on a zoning certificate would be far worse
 * than printing none.
 */
class SignatureLocator
{
    public const DIRECTORY = 'images/E-signitures';

    /** Filenames in the signature directory, read once per request. */
    private static ?array $files = null;

    /** Resolved paths keyed by name, so repeated signers cost one match. */
    private static array $resolved = [];

    /**
     * Path of this person's signature relative to public/, or null.
     */
    public static function forName(?string $name): ?string
    {
        $name = trim((string) $name);

        if ($name === '') {
            return null;
        }

        if (array_key_exists($name, self::$resolved)) {
            return self::$resolved[$name];
        }

        $target = self::normalise($name);

        $matches = array_values(array_filter(
            self::files(),
            fn (string $file) => self::normalise(pathinfo($file, PATHINFO_FILENAME)) === $target
        ));

        return self::$resolved[$name] = count($matches) === 1
            ? self::DIRECTORY . '/' . $matches[0]
            : null;
    }

    /**
     * Reduce a name to comparable letters: no case, punctuation, honorifics or
     * middle initials. "ENGR. Kay B. Aggarao" and "Kay Aggarao" both become
     * "kayaggarao".
     */
    private static function normalise(string $value): string
    {
        $withoutTitles = preg_replace(
            '/\b(engr|arch|atty|hon|mr|mrs|ms|dr|enp)\b\.?/iu',
            '',
            $value
        );

        $parts = preg_split('/\s+/', trim((string) $withoutTitles)) ?: [];

        $letters = fn (string $part) => preg_replace('/[^a-z]/', '', mb_strtolower($part));

        $kept = array_filter($parts, fn ($part) => mb_strlen($letters($part)) > 1);

        return $letters(implode('', $kept));
    }

    private static function files(): array
    {
        if (self::$files !== null) {
            return self::$files;
        }

        $directory = public_path(self::DIRECTORY);

        if (!is_dir($directory)) {
            return self::$files = [];
        }

        return self::$files = array_values(array_filter(
            scandir($directory) ?: [],
            fn (string $file) => (bool) preg_match('/\.(png|jpg|jpeg|webp)$/i', $file)
        ));
    }

    /** Testing hook: forget the cached listing. */
    public static function flush(): void
    {
        self::$files = null;
        self::$resolved = [];
    }
}
