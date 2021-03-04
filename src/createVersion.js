const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const semver = require('semver');

/**
 * Creates a version compatible with another.
 * @param  {string[]} currentVersions List of versions in the current commit
 * @param  {string[]} allVersions List of all versions in the repository
 * @param  {string} compatibleWith Version to honor
 * @return {string|null}
 */
function createCompatibleVersion({ currentVersions, allVersions, compatibleWith }) {
  if (currentVersions.some(version => semver.satisfies(version, `^${compatibleWith}`))) {
    return null;
  }

  const maxCompatible = semver.maxSatisfying(allVersions, `^${compatibleWith}`);
  if (!maxCompatible) {
    return compatibleWith;
  }

  return semver.inc(maxCompatible, 'minor');
}

/**
 * If the current commit returns a version, it returns null.
 * If there are other versions in the repository, the greater version + minor.
 * Otherwise, 1.0.0
 * @param  {string[]} currentVersions List of versions in the current commit
 * @param  {string[]} allVersions List of all versions in the repository
 * @return {string|null}
 */
function createGlobalVersion({ currentVersions, allVersions, compatibleWith }) {
  const currentVersion = semver.maxSatisfying(currentVersions, '*');
  const latestVersion = semver.maxSatisfying(allVersions, '*');

  if (currentVersion) {
    return null;
  }

  if (latestVersion) {
    return semver.inc(latestVersion, 'minor');
  }

  return '1.0.0';
}

/**
 * Returns the versions in the current commit and the version in all the repository
 * @param  {string} repositoryPath
 * @param  {string} prefix
 * @return {{ currentVersions: string[], allVersions: string[] }}
 */
function getVersions(repositoryPath, prefix) {
  const cwd = repositoryPath;
  const currentTagsStr = execSync('git tag --contains HEAD', { cwd }).toString();
  const allTagsStr = execSync('git tag -l | grep "^' + prefix + '" | sed "s/^'+ prefix + '//g"', { cwd }).toString();

  const parseTags = tagListStr => tagListStr.split('\n').map(s => s.trim());
  const extractVersionsFromTags = tags => tags.map(tag => semver.valid(tag)).filter(Boolean);

  const currentVersions = extractVersionsFromTags(parseTags(currentTagsStr));
  const allVersions = extractVersionsFromTags(parseTags(allTagsStr));

  return { currentVersions, allVersions };
}

/**
 * Returns a suitable version for the current commit in the given repository,
 * optionally compatible with the version found in the given file format.
 * @param  {string} repositoryPath
 * @param  {string} [compatibleWith] 'package.json' or 'composer.json'
 * @param  {boolean} [isNext=false] return the next version that would be created.
 * @return {string|null}
 */
function createVersion({ repositoryPath, compatibleWith, isNext, versionPath, prefix }) {
  const versions = getVersions(repositoryPath, prefix);
  const currentVersions = isNext ? [] : versions.currentVersions;
  const allVersions = versions.allVersions;

  if (compatibleWith != '') {
    const filePath = path.join(repositoryPath, versionPath, compatibleWith)
    if (!fs.existsSync(filePath)) {
      throw new Error("File " + compatibleWith + " does not exist at " + filePath)
    }
    const pkg = JSON.parse(fs.readFileSync(filePath));

    return createCompatibleVersion({
      currentVersions,
      allVersions,
      compatibleWith: semver.clean(pkg.version || '') 
    })
  }

  version = createGlobalVersion({ currentVersions, allVersions });
  if (version != null) {
    version = prefix + version
  }
  return version
}

module.exports = createVersion;
