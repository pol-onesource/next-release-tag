import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

export const fetchLatestReleaseTag = async () => {
  try {
    const githubToken = getInput('github_token', { required: true });
    const octokit = getOctokit(githubToken);
    const { owner, repo } = context.repo;

    const releasesPageIterator = octokit.paginate.iterator(
      octokit.rest.repos.listReleases,
      {
        owner,
        repo,
      }
    );

    for await (const { data: releases } of releasesPageIterator) {
      for (const { tag_name: tagName } of releases) {
        if (/^v\d{2}.*/.test(tagName)) {
          return tagName;
        }
      }
    }

    return null;
  } catch (error: any) {
    // No releases yet
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
