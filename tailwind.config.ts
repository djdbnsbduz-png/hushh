import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// Telegram brand colors
				telegram: {
					blue: 'hsl(var(--telegram-blue))',
					'blue-light': 'hsl(var(--telegram-blue-light))',
					'blue-dark': 'hsl(var(--telegram-blue-dark))',
				},

				// Message colors
				message: {
					sent: 'hsl(var(--message-sent))',
					'sent-foreground': 'hsl(var(--message-sent-foreground))',
					received: 'hsl(var(--message-received))',
					'received-foreground': 'hsl(var(--message-received-foreground))',
				},

				// Status colors
				online: 'hsl(var(--online))',
				typing: 'hsl(var(--typing))',
				read: 'hsl(var(--read))',

				// Card colors
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))',
				},

				// Primary colors
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
				},

				// Secondary colors
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},

				// Muted colors
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},

				// Input colors
				input: {
					DEFAULT: 'hsl(var(--input))',
					border: 'hsl(var(--input-border))',
					ring: 'hsl(var(--input-ring))',
				},

				// Sidebar colors
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					hover: 'hsl(var(--sidebar-hover))',
				}
			},
			backgroundImage: {
				'gradient-telegram': 'var(--gradient-telegram)',
				'gradient-message': 'var(--gradient-message)',
				'gradient-bg': 'var(--gradient-bg)',
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'chat': 'var(--shadow-chat)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'radius-sm': 'var(--radius-sm)',
				'radius-lg': 'var(--radius-lg)',
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
