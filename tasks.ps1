param(
    [Parameter(Mandatory)]
    [ValidateSet('dev', 'build', 'preview', 'test', 'export', 'fonts')]
    [string] $Task
)

$ErrorActionPreference = 'Stop'

$services = @{
    dev     = 'web'
    build   = 'build'
    preview = 'preview'
    test    = 'test'
    export  = 'export'
    fonts   = 'fonts'
}

docker compose run --rm --service-ports $services[$Task]
exit $LASTEXITCODE
