# Contributer's Guide

We welcome contributions - thanks for taking the time to contribute! Here are
some guidelines to help you get started. These are just guidelines, not rules,
use your best judgment and feel free to propose changes to this document in a
pull request.

## Discussion

While not absolutely requir			ed, it is encouraged that you first open an
[issue](https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin/issues)
for any bug or feature request. This allows discussion on the proper course of
action to take before coding begins.

## Building

```shell
npm install
```

## Changing

Most of the information you need to contribute code changes can [be found here](https://guides.github.com/activities/contributing-to-open-source/).
In short: fork, make your changes and submit a pull request (PR).

### Fork

Fork the project [on Github](https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin)
and check out your copy locally:

```shell
git clone https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin.git
cd protractor-numerator
```

### Create your branch

Create a feature branch and start hacking:

```shell
git checkout -b my-feature-branch
```

We practice HEAD-based development, which means all changes are applied
directly on top of master.

### Commit

First make sure git knows your name and email address:

```shell
git config --global user.name 'John Doe'
git config --global user.email 'john@example.com'
```

**Writing good commit message is important.** A commit message should be around
50 characters or less and contain a short description of the change and
reference issues fixed (if any). Include `Fixes #N`, where _N_ is the issue
number the commit fixes, if any.

### Rebase

Use `git rebase` (not `git merge`) to sync your work with the core repository
from time to time:

```shell
git remote add upstream https://github.com/wswebcreation/protractor-multiple-cucumber-html-reporter-plugin.git
git fetch upstream
git rebase upstream/master
```

### Test

Bug fixes and features **should have tests**. Look at other tests to see how
they should be structured.

This project makes use of code linting and e2e tests to make sure we don't break
anything. Before you submit your pull request make sure you pass all the tests:

You can run code linting with: `npm run lint`.
You can run all the e2e tests with: `npm test`.

### Push

```shell
git push origin my-feature-branch
```

Go to https://github.com/yourusername/protractor-multiple-cucumber-html-reporter-plugin.git and press the
_New pull request_ button and fill out the form.

A good PR comment message can look like this:

```text
Explain PR normatively in one line

Details of PR message are a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc.

Fixes #142
```

Pull requests are usually reviewed within a few days. If there are comments to
address, apply your changes in new commits (preferably
[fixups](http://git-scm.com/docs/git-commit)) and push to the same branch.

### Integration

When code review is complete, a committer will take your PR and integrate it on
protractor-multiple-cucumber-html-reporter-plugin's master branch. Because we like to keep a linear history
on the master branch, we will normally squash and rebase your branch history.