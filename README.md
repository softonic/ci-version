# ci-version

CLI program to determine the new version that should be assign to the current build/commit in a CI/CD workflow.

## Installation

You can install it with npm/yarn (`@softonic/ci-version`) or use the Docker image (`softonic/ci-version`) directly.

## Usage

With npm/yarn:

```
ci-version -r /path/to/my/repository
#> 1.2.0
ci-version -r /path/to/my/repository --compatible-with package.json
#> 1.2.0
ci-version -r /path/to/my/repository --compatible-with composer.json
#> 1.2.0
```

With Docker:

```
docker run -v /path/to/my/repository:/repo:ro softonic/ci-version
#> 1.2.0
docker run -v /path/to/my/repository:/repo:ro softonic/ci-version --compatible-with package.json
#> 1.2.0
docker run -v /path/to/my/repository:/repo:ro softonic/ci-version --compatible-with composer.json
#> 1.2.0
```

The repository should always be mounted in `/repo` or otherwise the entrypoint should be modified.

The version returned (if any) it is supposed to be used to create a new tag in the repository.

## How it works

### Without compatible-with option

- If the current commit contains version tag (e.g.: `1.0.0` or `v1.0.0`), then it returns nothing.
- Otherwise, it increments a minor version to the last version tag found in the whole repository or `1.0.0` if there is not any.

Examples:

- First build:

  ```
  Current commit tags: <none>
  All tags: <none>
  => New version: 1.0.0
  ```

- Build of a new commit:

  ```
  Current commit tags: <none>
  All tags: 1.1.0 1.2.0 1.3.0
  => New version: 1.4.0
  ```

- Rebuild a commit:

  ```
  Current commit tags: 1.2.0
  All tags: 1.0.0 1.1.0 1.2.0
  => New version: <none>
  ```

### With compatible-with option

- If it already contains a version tag (e.g.: `1.0.0` or `v1.0.0`)
  * And it is compatible with the version in the `package.json` or in the `composer.json`, then it returns nothing.
  * Otherwise, it increments the last version in the repository that is compatible.
- Otherwise, it increments the last version in the repository that is compatible with the one in the `package.json` or in the `composer.json`.

Examples:

- First build:

  ```
  Current commit tags: <none>
  All tags: <none>
  package.json/composer.json: 1.0.0
  => New version: 1.0.0
  ```

- Build of a new commit (package.json/composer.json unmodified):

  ```
  Current commit tags: <none>
  All tags: 1.1.0 1.2.0 1.3.0
  package.json/composer.json: 1.0.0
  => New version: 1.4.0
  ```

- Rebuild a commit:

  ```
  Current commit tags: 1.3.0
  All tags: 1.1.0 1.2.0 1.3.0
  package.json/composer.json: 1.0.0
  => New version: <none>
  ```

- First build post major increment in package.json/composer.json:

  ```
  Current commit tags: <none>
  All tags: 1.1.0 1.2.0 1.3.0
  package.json/composer.json: 2.0.0
  => New version: 2.0.0
  ```

- Rebuild post major increment in package.json/composer.json:

  ```
  Current commit tags: 2.0.0
  All tags: 1.1.0 1.2.0 1.3.0 2.0.0
  package.json/composer.json: 2.0.0
  => New version: <none>
  ```

## Contributing

1. Fork it: `git clone https://github.com/softonic/ci-version.git`
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Added some feature'`
4. Check the build: `npm run build`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
