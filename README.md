# Font Maker

Font Maker is a browser based pixel art editor for making simple "fonts".
(More precisely, sets of characters exportable in image form)

You can access it here: https://oscarglo.github.io/fontmaker

This project was born after participating in my first game jam, where I discovered the pain
of making text sprites pixel by pixel. This motivated me in creating this editor for
future projects.

## Current features

The application has a main canvas, where you can draw your pixel art, with a bunch of
little windows on top called "widgets". Those widgets can be dragged on the screen to
let you choose whatever layout you're more comfortable with.

You can also zoom on the canvas using the mouse wheel.

Here are the features by widget:

### Tools

- **Pencil:** Lets you draw pixels in the current color by left clicking, and erase pixels
by right clicking. Pressing alt when left clicking lets you use the eyedropper.
- **Eyedropper:** Lets you set the current color to that of a pixel by clicking on it.
- **Move:** Lets you move around the canvas by dragging. You can also hold the mouse wheel
to use this tool with any other tool selected.

### Color

Drag the sliders around to choose a color in [HSL](https://en.wikipedia.org/wiki/HSL_and_HSV).
You can also click the color preview to input an RGB or hex color.

### Palette

Left click on a color to select it, right click to remove it from the palette. You can add
the current color to the palette by clicking the + button.

### Grid

This lets you change the options of the pixel grid displayed on the canvas. The H/V lines
option lets you change the spacing between main grid lines (those that are bolder). A
spacing of 0 just means you won't main lines in this direction.

## Future additions

The app doesn't have a way to actually edit a character or even a font. This is my main goal
for future updates, paired with improvements to the editor such as new tools (Select,
Copy/Cut/Paste, Fill) or a better UI.

In the future, you should be able to import and export fonts, but also to write text in a
font and export the sprite as a png. Each character should be able to be tweaked (baseline,
spacing) along with custom ligatures.