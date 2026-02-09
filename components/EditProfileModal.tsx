"use client"

import React, { useState, useEffect } from 'react'
import { X, Camera, Loader2, Save } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
    creator: any
    onUpdate: (updatedCreator: any) => void
}

export default function EditProfileModal({ isOpen, onClose, creator, onUpdate }: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        location: '',
        hashtags: '',
        twitter: '',
        website: ''
    })
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (creator) {
            setFormData({
                username: creator.username || '',
                bio: creator.bio || '',
                location: creator.location || '',
                hashtags: creator.hashtags?.join(', ') || '',
                twitter: creator.socialLinks?.twitter || '',
                website: creator.socialLinks?.website || ''
            })
            setAvatarPreview(creator.avatar || null)
        }
    }, [creator])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setAvatarPreview(base64String)
                setAvatarBase64(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('jwt')
            if (!token) {
                setError('You must be logged in to update your profile.')
                setLoading(false)
                return
            }

            const response = await fetch(`/api/creators/${creator._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    hashtags: formData.hashtags.split(',').map(s => s.trim()).filter(Boolean),
                    socialLinks: {
                        twitter: formData.twitter,
                        website: formData.website
                    },
                    avatarBase64: avatarBase64 || undefined
                })
            })

            const data = await response.json()
            if (response.ok) {
                onUpdate(data.creator)
                onClose()
            } else {
                setError(data.error || 'Failed to update profile')
            }
        } catch (err) {
            console.error('Update error:', err)
            setError('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-meta-navy/5">
                    <h2 className="text-xl font-black uppercase tracking-tight text-meta-navy">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-meta-navy/5 rounded-full transition-colors text-meta-navy/40 hover:text-meta-navy">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-4 border-meta-peach bg-meta-navy/5 overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview.startsWith('data:') ? avatarPreview : (resolveMediaUrl(avatarPreview) || '')}
                                        className="w-full h-full object-cover"
                                        alt="Avatar Preview"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-meta-navy/20">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-meta-navy/40 uppercase tracking-widest">Change Profile Photo</p>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-meta-navy/50 ml-1">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3 bg-meta-navy/5 border-none rounded-2xl focus:ring-2 focus:ring-meta-orange transition-all text-sm font-bold"
                                placeholder="bunny_ranch"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-meta-navy/50 ml-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-meta-navy/5 border-none rounded-2xl focus:ring-2 focus:ring-meta-orange transition-all text-sm font-medium resize-none"
                                placeholder="Tell your fans something about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-meta-navy/50 ml-1">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-meta-navy/5 border-none rounded-2xl focus:ring-2 focus:ring-meta-orange transition-all text-sm font-bold"
                                    placeholder="Global"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-meta-navy/50 ml-1">Hashtags</label>
                                <input
                                    type="text"
                                    value={formData.hashtags}
                                    onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                                    className="w-full px-4 py-3 bg-meta-navy/5 border-none rounded-2xl focus:ring-2 focus:ring-meta-orange transition-all text-sm font-bold"
                                    placeholder="bunny, vault, exclusive"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-meta-navy/50 ml-1">X (Twitter) URL</label>
                            <input
                                type="text"
                                value={formData.twitter}
                                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                className="w-full px-4 py-3 bg-meta-navy/5 border-none rounded-2xl focus:ring-2 focus:ring-meta-orange transition-all text-sm font-bold"
                                placeholder="https://x.com/yourname"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-meta-navy/50 ml-1">Website</label>
                            <input
                                type="text"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-3 bg-meta-navy/5 border-none rounded-2xl focus:ring-2 focus:ring-meta-orange transition-all text-sm font-bold"
                                placeholder="https://yourpage.com"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-tighter">
                            {error}
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-meta-navy/5 bg-meta-peach/20">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-14 bg-meta-navy text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-meta-navy/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
