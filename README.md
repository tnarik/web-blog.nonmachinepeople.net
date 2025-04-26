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