"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TagManager } from "@/components/tag-manager"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Influencer } from "@/types/influencer"
import LS from "@/app/service/LS"
import { Plus, X, Loader2 } from "lucide-react"

interface AddInfluencerFormProps {
  onInfluencerAdded: (influencer: Influencer) => void
}

export function AddInfluencerForm({ onInfluencerAdded }: AddInfluencerFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [newBrand, setNewBrand] = useState("")
  
  const [formData, setFormData] = useState({
    handle: "",
    profile_link: "",
    followers: 0,
    email: "",
    rate: 0,
    categories: [] as string[],
    followers_age: "",
    followers_sex: "",
    engagement_rate: 0,
    platform: "Instagram",
    brands_worked_with: [] as string[],
    tags: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "followers" || name === "rate" || name === "engagementRate" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

  const handleAddBrand = () => {
    if (newBrand.trim() && !formData.brands_worked_with.includes(newBrand.trim())) {
      setFormData((prev) => ({
        ...prev,
        brands_worked_with: [...prev.brands_worked_with, newBrand.trim()],
      }))
      setNewBrand("")
    }
  }

  const handleRemoveBrand = (brand: string) => {
    console.log('brand', brand)
    setFormData((prev) => ({
      ...prev,
      brands_worked_with: prev.brands_worked_with.filter((b) => b !== brand),
    }))
  }

  const resetForm = () => {
    setFormData({
      handle: "",
      profile_link: "",
      followers: 0,
      email: "",
      rate: 0,
      categories: [],
      followers_age: "",
      followers_sex: "",
      engagement_rate: 0,
      platform: "Instagram",
      brands_worked_with: [],
      tags: [],
    })
    setNewCategory("")
    setNewBrand("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.handle.trim()) {
      setError("Handle is required")
      return
    }

    const userId = LS.getUserId()
    if (!userId) {
      setError("You must be logged in to add influencers")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create the data object for the database with userId included
      const influencerData = {
        ...formData,
        userId,
        notes: [],
        files: [],
        messages: [],
        campaigns: [],
      }

      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(influencerData),
      })

      if (!response.ok) {
        throw new Error('Failed to create influencer')
      }

      const newInfluencer = await response.json()
      
      onInfluencerAdded(newInfluencer)
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create influencer:", error)
      setError("Failed to create influencer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Influencer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Influencer</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new influencer to your database.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="handle">Handle *</Label>
              <Input
                id="handle"
                name="handle"
                placeholder="@username"
                value={formData.handle}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => handleSelectChange("platform", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Twitch">Twitch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile_link">Profile Link</Label>
              <Input
                id="profile_link"
                name="profile_link"
                placeholder="https://..."
                value={formData.profile_link}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followers">Followers</Label>
              <Input
                id="followers"
                name="followers"
                type="number"
                min="0"
                value={formData.followers}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate">Rate ($)</Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                min="0"
                value={formData.rate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
              <Input
                id="engagementRate"
                name="engagementRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.engagement_rate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followers_age">Followers Age</Label>
              <Select value={formData.followers_age} onValueChange={(value) => handleSelectChange("followers_age", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="13-17">13-17</SelectItem>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45-54">45-54</SelectItem>
                  <SelectItem value="55-64">55-64</SelectItem>
                  <SelectItem value="65+">65+</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>

            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followers_sex">Followers Gender</Label>
              <Select value={formData.followers_sex} onValueChange={(value) => handleSelectChange("followers_sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender distribution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mixed">Mixed/Balanced</SelectItem>
                  <SelectItem value="Mostly Male">Mostly Male</SelectItem>
                  <SelectItem value="Mostly Female">Mostly Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {category}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveCategory(category)} />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Add category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCategory()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Brands Worked With</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                  {formData.brands_worked_with.map((brand, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {brand}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveBrand(brand)} />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Add brand..."
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddBrand()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags Section */}
            <TagManager
              tags={formData.tags}
              onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Add tags like 'US-based', 'top performer'..."
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Influencer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 