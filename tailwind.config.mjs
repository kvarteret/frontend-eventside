/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
    	extend: {
    		colors: {
    			'primary-red': {
    				'50': 'oklch(0.8044 0.2068 24.93)',
    				'100': 'oklch(0.7744 0.2068 24.93)',
    				'200': 'oklch(0.7444 0.2068 24.93)',
    				'300': 'oklch(0.7144 0.2068 24.93)',
    				'400': 'oklch(0.6844 0.2068 24.93)',
    				'500': 'oklch(0.6544 0.2068 24.93)',
    				'600': 'oklch(0.6244 0.2068 24.93)',
    				'700': 'oklch(0.5944 0.2068 24.93)',
    				'800': 'oklch(0.5644 0.2068 24.93)',
    				'900': 'oklch(0.5344 0.2068 24.93)',
    				'950': 'oklch(0.5044 0.2068 24.93)',
    				DEFAULT: 'oklch(0.6544 0.2068 24.93)'
    			},
                // todo find a better yellow based on the app design kvarteret_intenrbevis repo
    			'primary-yellow': {
    				'50': 'oklch(0.8044 0.2068 84.93)',
    				'100': 'oklch(0.7744 0.2068 84.93)',
    				'200': 'oklch(0.7444 0.2068 84.93)',
    				'300': 'oklch(0.7144 0.2068 84.93)',
    				'400': 'oklch(0.6844 0.2068 84.93)',
    				'500': 'oklch(0.6544 0.2068 84.93)',
    				'600': 'oklch(0.6244 0.2068 84.93)',
    				'700': 'oklch(0.5944 0.2068 84.93)',
    				'800': 'oklch(0.5644 0.2068 84.93)',
    				'900': 'oklch(0.5344 0.2068 84.93)',
    				'950': 'oklch(0.5044 0.2068 84.93)',
    				DEFAULT: 'oklch(0.6544 0.2068 84.93)'
    			},
    			'primary-blue': {
    				'50': 'oklch(0.8044 0.2068 264.93)',
    				'100': 'oklch(0.7744 0.2068 264.93)',
    				'200': 'oklch(0.7444 0.2068 264.93)',
    				'300': 'oklch(0.7144 0.2068 264.93)',
    				'400': 'oklch(0.6844 0.2068 264.93)',
    				'500': 'oklch(0.6544 0.2068 264.93)',
    				'600': 'oklch(0.6244 0.2068 264.93)',
    				'700': 'oklch(0.5944 0.2068 264.93)',
    				'800': 'oklch(0.5644 0.2068 264.93)',
    				'900': 'oklch(0.5344 0.2068 264.93)',
    				'950': 'oklch(0.5044 0.2068 264.93)',
    				DEFAULT: 'oklch(0.6544 0.2068 264.93)'
    			},
    			'dark-red': '#762424',
    		},
    		fontFamily: {
    			glacial: [
    				'sans-serif'
    			]
    		},
    		animation: {
    			marquee: 'marquee var(--duration) infinite linear',
    			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
    		},
    		keyframes: {
    			marquee: {
    				'0%': {
    					transform: 'translateX(0%)'
    				},
    				'100%': {
    					transform: 'translateX(-100%)'
    				},
    				from: {
    					transform: 'translateX(0)'
    				},
    				to: {
    					transform: 'translateX(calc(-100% - var(--gap)))'
    				}
    			},
    			'marquee-vertical': {
    				from: {
    					transform: 'translateY(0)'
    				},
    				to: {
    					transform: 'translateY(calc(-100% - var(--gap)))'
    				}
    			}
    		}
    	}
    },
	plugins: [],
}
