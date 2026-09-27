<?php

namespace App\Services;

final class DocumentIntegrityResult
{
    public function __construct(
        public readonly ?string $hash,
        public readonly ?int $duplicateOfId,
        public readonly bool $possibleEditingFlag,
        public readonly ?string $possibleEditingReason,
    ) {}

    public function toAttributes(): array
    {
        return [
            'file_hash' => $this->hash,
            'duplicate_of_id' => $this->duplicateOfId,
            'possible_editing_flag' => $this->possibleEditingFlag,
            'possible_editing_reason' => $this->possibleEditingReason,
        ];
    }
}
