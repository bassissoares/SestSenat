$ErrorActionPreference = 'Stop'

$requiredFiles = @(
    'CODEX_PATHS.toml',
    'README.md',
    'ESCOPO.md',
    'DIRETRIZES.md',
    'DADOS.md',
    'GOVERNANCA.md',
    'QUALITY_ROADMAP.md',
    'TESTES.md',
    'DECISOES.md',
    'demandas.md'
)

$missingFiles = $requiredFiles | Where-Object {
    -not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $_) -PathType Leaf)
}

if ($missingFiles.Count -gt 0) {
    throw "Arquivos obrigatorios ausentes: $($missingFiles -join ', ')"
}

$emptyFiles = $requiredFiles | Where-Object {
    (Get-Item -LiteralPath (Join-Path $PSScriptRoot $_)).Length -eq 0
}

if ($emptyFiles.Count -gt 0) {
    throw "Arquivos obrigatorios vazios: $($emptyFiles -join ', ')"
}

Write-Host 'Checks de documentacao: OK'
