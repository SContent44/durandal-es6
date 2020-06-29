<h1  align="center">durandal-es6</h3>

<div  align="center">
A proof of concept of having DurandalJS not need to use RequireJS, enabling use of modern tooling for bundling Durandal SPA</p>
<br />
<a  href="https://scontent44.github.io">View Demo</a> · <a  href="https://github.com/SContent44/durandal-es6/issues">Report Bug</a>
</div>

<!-- TABLE OF CONTENTS -->

## Table of Contents

-   [About the Project](#about-the-project)

*   [Built With](#built-with)

-   [Getting Started](#getting-started)

    -   [Installation](#installation)

-   [Usage](#usage)

*   [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

This is written as a proof of concept and testing ground for being able to run [DurandalJS](https://github.com/BlueSpire/Durandal) without having to use RequireJS and instead using module imports.

This library achieves this by changing the `acquire` function in the System module and updating the behavior throughout for this change.

This is only designed for people who are currently using DurandalJS and are looking for an in place - for example using the same build tooling (such as Webpack or Rollup).

### Built With

This work is of course based on top of [DurandalJS](https://github.com/BlueSpire/Durandal).

It still makes use of the following libraries:

-   [jQuery](https://github.com/jquery/jquery) - updated to 3.5.1 to avoid security vulnerabilities

*   [jQuery Migrate](https://github.com/jquery/jquery-migrate) - for enabling use of deprecated APIs (The dialog module still has some deprecated code)

-   [KnockoutJs](https://github.com/knockout/knockout)

<!-- GETTING STARTED -->

## Getting Started

You can find the library on npmjs.

You can also clone down the repo which includes a starter-kit site. This is largely the same as the Durandal Starterkit site with a change to use [Lorem Picsum](https://picsum.photos/) instead of Flickr and a page for Knockout components (this is more as a demonstration around the Component loader using Webpack).

### Installation

If you clone down repo you will just need to follow these steps from the root of the folder:

-   Clone the repo

*   In the root folder run `npm install`

-   In the root folder run `npm lerna-setup` to clean any current node_modules in child folders and bootstrap the packages

*   You can then run:

-   `npm dev-starter` to run a webpack-dev-server of the starterkit

*   `npm build-starter` to build the starterkit with Webpack

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.
