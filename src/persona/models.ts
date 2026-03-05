export type PersonaAvatar = 'Egg' | 'Robot' | 'Ninja' | 'Rocket' | 'Cat'

export type Persona = {
    id: string
    name: string
    avatar: PersonaAvatar
}

export const DEFAULT_PERSONA: Persona = {
    id: 'default',
    name: 'Default',
    avatar: 'Egg',
}

export const AVATAR_OPTIONS: PersonaAvatar[] = ['Egg', 'Robot', 'Ninja', 'Rocket', 'Cat']

