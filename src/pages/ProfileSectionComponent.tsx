import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { Button, Form, FormControl } from 'react-bootstrap'
import { emitNewNotification, emitProfileChanged } from '../events/Events'
import { ProfileRepository } from '../profile/ProfileRepository'
import { Profile } from '../profile/models'
import './ProfileSectionComponent.scss'

const profileRepository = new ProfileRepository()

export const ProfileSectionComponent = (): ReactElement => {
    const [profiles, setProfiles] = useState<Profile[]>(() => profileRepository.getProfiles())
    const [activeProfileId, setActiveProfileId] = useState<string>(() => profileRepository.getActiveProfile().id)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState<string>('')

    const refreshProfiles = (): void => {
        const next = profileRepository.getProfiles()
        setProfiles(next)
        setActiveProfileId(profileRepository.getActiveProfile().id)
    }

    const handleToggleProfile = (profileId: string): void => {
        if (profileId === activeProfileId) return
        profileRepository.setActiveProfile(profileId)
        setActiveProfileId(profileId)
        emitProfileChanged(profileId)
    }

    const handleStartEdit = (profile: Profile): void => {
        setEditingId(profile.id)
        setEditingName(profile.name)
    }

    const handleSaveEdit = (profileId: string): void => {
        const trimmed = editingName.trim()
        if (!trimmed) {
            emitNewNotification({ message: 'Profile name cannot be empty' })
            setEditingId(null)
            return
        }

        const currentProfile = profiles.find((p) => p.id === profileId)
        if (!currentProfile) return

        if (currentProfile.name === trimmed) {
            setEditingId(null)
            return
        }

        try {
            profileRepository.updateProfile(profileId, trimmed)
            refreshProfiles()
            setEditingId(null)
            emitProfileChanged(activeProfileId)
        } catch (error) {
            emitNewNotification({ message: (error as Error).message })
        }
    }

    const handleDeleteProfile = (profileId: string): void => {
        const toDelete = profiles.find((p) => p.id === profileId)
        if (!toDelete) return

        const deleted = profileRepository.deleteProfile(profileId)
        if (!deleted) {
            emitNewNotification({ message: 'At least one profile must exist' })
            return
        }
        emitNewNotification({ message: `Profile ${toDelete.name} deleted` })
        const nextActiveId = profileRepository.getActiveProfile().id
        setActiveProfileId(nextActiveId)
        emitProfileChanged(nextActiveId)
        refreshProfiles()
    }

    const handleAddProfile = (): void => {
        const nextName = profileRepository.getNextProfileName()
        try {
            const created = profileRepository.addProfile(nextName)
            refreshProfiles()
            emitNewNotification({ message: `Profile ${created.name} created` })
        } catch (error) {
            emitNewNotification({ message: (error as Error).message })
        }
    }

    return (
        <>
            <h4>Profiles</h4>
            <p className="text-muted mb-3">Each profile keeps its own workflow filters and project/job selections.</p>

            <div className="profile-list mb-2">
                {profiles.map((profile) => (
                    <div key={profile.id} className="profile-list__item">
                        <Form.Switch
                            id={`profile-switch-${profile.id}`}
                            checked={profile.id === activeProfileId}
                            onChange={() => handleToggleProfile(profile.id)}
                            className="profile-list__switch"
                        />

                        {editingId === profile.id ? (
                            <FormControl
                                size="sm"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={() => handleSaveEdit(profile.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(profile.id)
                                    if (e.key === 'Escape') {
                                        setEditingId(null)
                                        setEditingName('')
                                    }
                                }}
                                className="profile-list__edit"
                                autoFocus
                            />
                        ) : (
                            <span className="profile-list__name" onClick={() => handleStartEdit(profile)}>
                                {profile.name}
                            </span>
                        )}

                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id)}
                            disabled={profiles.length <= 1}
                            className="profile-list__delete"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="text-end">
                <Button variant="outline-secondary" size="sm" onClick={handleAddProfile}>
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    Add Profile
                </Button>
            </div>
        </>
    )
}

