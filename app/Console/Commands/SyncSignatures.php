<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SyncSignatures extends Command
{
    protected $signature = 'signatures:sync {--dry-run : Show what would change without saving}';

    protected $description = 'Match the e-signature images in public/images/E-signitures to staff accounts';

    /**
     * The image files are named after the person who signed them, but the spelling
     * does not always match the account exactly ("April U." vs "April V.",
     * "Paguig" vs "Pauig"), so names are compared on their letters alone and then
     * on surname plus first initial. A signature on a government document must
     * never land on the wrong name, so anything short of a confident match is
     * reported and skipped rather than guessed at.
     */
    public function handle(): int
    {
        $directory = public_path('images/E-signitures');

        if (!is_dir($directory)) {
            $this->error("No signature directory at {$directory}");
            return self::FAILURE;
        }

        $files = collect(scandir($directory))
            ->filter(fn ($file) => preg_match('/\.(png|jpg|jpeg|webp)$/i', $file));

        if ($files->isEmpty()) {
            $this->warn('No signature images found.');
            return self::SUCCESS;
        }

        $staff = User::whereIn('user_type', ['admin', 'super_admin'])->get();
        $dryRun = (bool) $this->option('dry-run');
        $matched = 0;

        foreach ($files as $file) {
            $stem = pathinfo($file, PATHINFO_FILENAME);
            $user = $this->resolveUser($stem, $staff);

            if (!$user) {
                $this->warn("  no account matches \"{$stem}\" — skipped");
                continue;
            }

            $path = 'images/E-signitures/' . $file;

            if ($user->signature_path === $path) {
                $this->line("  {$user->name} already set");
                $matched++;
                continue;
            }

            $this->info("  {$stem} -> {$user->name}");

            if (!$dryRun) {
                $user->update(['signature_path' => $path]);
            }

            $matched++;
        }

        // A path pointing at a file that is no longer there renders as a broken
        // image on the certificate, which is worse than no signature at all.
        foreach ($staff as $user) {
            if ($user->signature_path && !file_exists(public_path($user->signature_path))) {
                $this->warn("  {$user->name} points at a missing file ({$user->signature_path}) — cleared");
                if (!$dryRun) {
                    $user->update(['signature_path' => null]);
                }
            }
        }

        $this->newLine();
        $this->info($dryRun
            ? "{$matched} signature(s) would be linked."
            : "{$matched} signature(s) linked.");

        return self::SUCCESS;
    }

    private function resolveUser(string $stem, $staff): ?User
    {
        $letters = fn ($value) => preg_replace('/[^a-z]/', '', mb_strtolower($value));
        $target = $letters($stem);

        // Some files are named for the office rather than the person holding it
        // ("zoningadministrator.png"). There is one Zoning Administrator, so that
        // one resolves; a role several people share is left for the name match.
        if ($target === 'zoningadministrator') {
            $administrators = $staff->where('user_type', 'super_admin');

            return $administrators->count() === 1 ? $administrators->first() : null;
        }

        // Exact match on letters alone: "Mary Jane P. Bulauan" == "mary jane p bulauan"
        $exact = $staff->first(fn ($user) => $letters($user->name) === $target);
        if ($exact) {
            return $exact;
        }

        // Otherwise the surname has to match and the first initial has to agree,
        // which separates "April Cuntapay" from "Anna Cuntapay" without demanding
        // the middle initial be spelled the same way.
        $fileParts = preg_split('/\s+/', trim($stem));
        $fileSurname = $letters(end($fileParts));
        $fileInitial = mb_substr($letters($fileParts[0]), 0, 1);

        $candidates = $staff->filter(function ($user) use ($letters, $fileSurname, $fileInitial) {
            $parts = preg_split('/\s+/', trim($user->name));
            $surname = $letters(end($parts));
            $initial = mb_substr($letters($parts[0]), 0, 1);

            return $initial === $fileInitial
                && $surname !== ''
                && (
                    $surname === $fileSurname
                    // Tolerates a transposed or dropped letter: "Pauig" / "Paguig"
                    || levenshtein($surname, $fileSurname) <= 1
                );
        });

        return $candidates->count() === 1 ? $candidates->first() : null;
    }
}
