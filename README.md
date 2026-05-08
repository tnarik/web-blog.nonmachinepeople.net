# My Test Hugo Site

This is just a test to play around locally with Hugo a bit and see how/if I can setup something to:

* Track my future DnD solo games
* Track The WIlson Wolfe Affair game
* Potentially have a Zettelkasten here
* Any other thing that I might prefer keeping as a "blog" of some sort.

I'm not sure if I can use Hugo to protect some pages (like my Notions stuff), and how well would it work when used from an iPad (for instance)

The main requirement is to have a backup for this, be able to access and edit while offline, and be able to publish easily.



# How to make it work as I want it to

I'm learning bit by bit and now I'm using themes as Hugo Modules instead of git submodules. Files are not downladed within the project itself but referenced and used.

I'm trying to set my theme as a module separate from the content.
My theme will import a common theme (PaperMod), customise it and bring in other content/theming, also via modules.

I thought it would be easy to do the whole thing from local directories, but it requires playing around with the `go.mod` files to replace repos with paths. And it seems the repos are verified, so the names require proper thinking.

[https://discourse.gohugo.io/t/how-to-do-hugo-0-77-module-replacements-with-nested-modules-right/34225](https://discourse.gohugo.io/t/how-to-do-hugo-0-77-module-replacements-with-nested-modules-right/34225)


# Development

You can use a `.envrc` file with this content:

```
export HUGO_MODULE_WORKSPACE=go.work
```

and a `go.work` file with a content similar to:

```
go 1.23.1

use (
	.
	/Users/tnarik/Desktop/web-blog.nonmachinepeople.net-theme
	/Users/tnarik/Desktop/tnarik2_theme_assets
	/Users/tnarik/Desktop/tnarik2_homebrewery
)
```

This allows developing theme and assets in parallel, without having to push everything to a remote repo.

The current `.gitignore` will ignore those files.

# Image processing

As I take pictures with my iPhone, and it produces HEIC files, I want to convert them to AVIF (which most modern browsers can render). I used `magick` before, but i want to see if the results are better with `sharp` (which I added as a module).
Due to licensing, `libvips` is required to manipulate HEIC files. I use `brew install vips` to install that. And this needs to be installed before running `npm install`. The version of `libvips` can be found using `pkg-config --modversion vips-cpp`.
To build with this dependency, `node-addon-api` and `node-gyp` are added as dependencies as well.

`npx sharp -i ./IMG_0562.HEIC -o ./ -f avif -q 70 --hbitdepth 12 --effort 4 --alphaQuality 100 `

We specify values, because otherwise there are some defaults (such as `-q 50`).


## Markdown validation

I've been playing a bit with this command and ways of making sure that the validation is correct (criteria tuned to my usage and avoiding issues due to Go templates, mainly by ignoring that section): `npx markdownlint-cli2 content/**/*.md`

What I found out is that MarkdownIt plugins are not useful because the current rules use micromark mostly. Also, custom rules are useless because they cannot mark some areas as already reviewed, so they just add additional criteria. I ended up settling for a **modify file** -> **lint file**, where I am using markdownlint-cli2 internal APIs (it is a CLI but I am using its modules) to inject my changes. Two different approaches tested:

* inject a fileContent override, that lazily changes the content, supressing the Go Template lines (it could also be made into a static fileContent generation to override)
* a most straightforward replacement as files, but using a virtual filesystem. I was trying to get it working from the CLI (via piping or some CLI wrapping), but ended up needing to create a proper javascript wrapper.
