import { writeFileSync } from "fs";
import config from "./theme.config.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifest = {
	manifest_version: 3,
	name: "Tenebris Theme",
	version: "1.0.0",
	theme: {
		images: {

            // tabs
			// theme_frame: config.image,
			// theme_frame_inactive: config.image,
			// theme_frame_incognito: config.image,
			// theme_frame_incognito_inactive: config.image,
            // toolbar
			// theme_toolbar: config.image,
            // theme_tab_background: config.image, // inactive tabs and just them
            // theme_ntp_background: testImage

            // need to all be pngs
            theme_frame: config.image, // upper tabs background. also overwrites the theme_frame_inactive if not set
            theme_frame_inactive: config.image, // upper tabs background, inactive
            theme_toolbar: config.image, // toolbar background + bookmarks bar
            theme_tab_background: config.image, // inactive tabs and just them
            theme_tab_background_inactive: config.image, // inactive tabs and just them, when window is inactive
            theme_ntp_background: config.image, // new tab image... fades in from the ntp_background color to the image
            theme_frame_overlay: config.image, // tab bar, without tabs
            theme_frame_overlay_inactive: config.image, // tab bar, without tabs, when window is inactive
            theme_button_background: config.image, // doesn't seem to change anything
            // theme_ntp_attribution: testImage // changes new tab page background, and also google color for some reason?
            // theme_window_control_background: testImage // unknown
		},
		colors: {
            frame: config.colors.main,                       // upper tabs background
            frame_inactive: config.colors.main,            // upper tabs background, inactive
            // frame_incognito: [180, 0, 255],           // unused most likely
            // frame_incognito_inactive: [255, 140, 0],  // unused most likely
            // background_tab: [180, 0, 255],                 // background for the specific tab, defaults to frame
            // background_tab_inactive: [255, 140, 0], // background for the specific tab, inactive, defaults to frame_inactive

            tab_text: config.colors.text,                    // text of the currently selected tab
            tab_background_text: config.colors.secondaryText,       // text of the inactive tabs
            // tab_background_text_inactive: config.colors.text, // text of the inactive tabs when window is inactive

            toolbar: config.colors.main,                     // whole toolbar + bookmark bar + currently selected tab
            toolbar_button_icon: config.colors.accent,         // icons on the toolbar, nice for accent
            toolbar_text: config.colors.accent,               // text on the toolbar/in some settings regarding the toolbar

            // button_background: config.colors.main,         // minimize, maximize and close buttons

            bookmark_text: config.colors.text,             // text color on bookmark bar
            ntp_background: config.colors.main,             // new tab page background
            omnibox_background: config.colors.main,         // search bar background, when active
            // omnibox_text: [0,0,255],               // search bar text, when active, otherwise only some words. also changes some icons in the search bar

            // Don't seem to be doing anything rn
            /*
            ntp_text: [255, 0, 0],                // White
            ntp_link: [0, 100, 0],                    // Dark Green
            ntp_link_underline: [255, 215, 0],        // Gold
            ntp_header: [128, 128, 128],              // Gray
            ntp_section: [255, 105, 180],             // Light Pink
            ntp_section_text: [75, 0, 130],           // Indigo
            ntp_section_link: [127, 255, 0],          // Chartreuse
            ntp_section_link_underline: [0, 128, 128], // Teal
            control_background: [255, 160, 200]       // Pastel Pink
            */
		},
		tints: {
			// frame: [0.5, 0.5, 0.5], // changes the tint of the upper tabs
			frame_inactive: [-1, -1, -1],
            background_tab: [-1, 0.5, 0],
            // buttons: [-1, -1, -1],
		},
	},
};

writeFileSync(__dirname + "/manifest.json", JSON.stringify(manifest, null, 2));

console.log("Tenebris theme manifest generated.");
