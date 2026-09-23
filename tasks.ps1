param(
    [Parameter(Mandatory)]
    [ValidateSet('dev', 'build', 'preview', 'test', 'export')]
    [string] $Task
)

$ErrorActionPreference = 'Stop'

$services = @{
    dev     = 'web'
    build   = 'build'
    preview = 'preview'
    test    = 'test'
    export  = 'export'
}

docker compose run --rm --service-ports $services[$Task]
exit $LASTEXITCODE
