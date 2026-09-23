param(
    [Parameter(Mandatory)]
    [ValidateSet('dev', 'build', 'preview', 'test')]
    [string] $Task
)

$ErrorActionPreference = 'Stop'

$services = @{
    dev     = 'web'
    build   = 'build'
    preview = 'preview'
    test    = 'test'
}

docker compose run --rm --service-ports $services[$Task]
exit $LASTEXITCODE
