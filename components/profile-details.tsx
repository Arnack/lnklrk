"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagManager } from "@/components/tag-manager"
import type { Influencer } from "@/types/influencer"
import { Check, Edit, Plus, X } from "lucide-react"

interface ProfileDetailsProps {
  influencer: Influencer
  onUpdate: (updatedInfluencer: Influencer) => void
}

export function ProfileDetails({ influencer, onUpdate }: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Influencer>(influencer)
  const [newCategory, setNewCategory] = useState("")
  const [newBrand, setNewBrand] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "followers" || name === "rate" || name === "engagementRate" || name === "engagement_rate" ? Number(value) : value,
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
    if (newBrand.trim() && !formData.brands_worked_with?.includes(newBrand.trim())) {
      setFormData((prev) => ({
        ...prev,
        brands_worked_with: [...(prev.brands_worked_with || []), newBrand.trim()],
      }))
      setNewBrand("")
    }
  }

  const handleRemoveBrand = (brand: string) => {
    console.log('brand', brand)
    setFormData((prev) => ({
      ...prev,
      brands_worked_with: prev.brands_worked_with?.filter((b) => b !== brand) || [],
    }))
  }

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(influencer)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Influencer Profile</CardTitle>
          <CardDescription>View and edit influencer details</CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="handle">Handle</Label>
              {isEditing ? (
                <Input id="handle" name="handle" value={formData.handle} onChange={handleInputChange} />
              ) : (
                <div className="text-lg font-medium">{influencer.handle}</div>
              )}
            </div>

            <div>
              <Label htmlFor="profile_link">Profile Link</Label>
              {isEditing ? (
                <Input id="profile_link" name="profile_link" value={formData.profile_link} onChange={handleInputChange} />
              ) : (
                <a
                  href={influencer.profile_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all block"
                >
                  {influencer.profile_link}
                </a>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleInputChange} />
              ) : (
                <div>{influencer.email || "Not provided"}</div>
              )}
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
              {isEditing ? (
                <Input id="platform" name="platform" value={formData.platform} onChange={handleInputChange} />
              ) : (
                <div>{influencer.platform}</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="followers">Followers</Label>
              {isEditing ? (
                <Input
                  id="followers"
                  name="followers"
                  type="number"
                  value={formData.followers}
                  onChange={handleInputChange}
                />
              ) : (
                <div>{influencer.followers.toLocaleString()}</div>
              )}
            </div>

            <div>
              <Label htmlFor="rate">Rate ($)</Label>
              {isEditing ? (
                <Input id="rate" name="rate" type="number" value={formData.rate} onChange={handleInputChange} />
              ) : (
                <div>${influencer.rate.toLocaleString()}</div>
              )}
            </div>

            <div>
              <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
              {isEditing ? (
                <Input
                  id="engagementRate"
                  name="engagementRate"
                  type="number"
                  step="0.01"
                  value={formData.engagementRate || formData.engagement_rate}
                  onChange={handleInputChange}
                />
              ) : (
                <div>{influencer.engagementRate || influencer.engagement_rate}%</div>
              )}
            </div>

            <div>
              <Label htmlFor="followersAge">Followers Age</Label>
              {isEditing ? (
                <Select
                  value={formData.followersAge || formData.followers_age}
                  onValueChange={(value) => handleSelectChange("followersAge", value)}
                >
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
              ) : (
                <div>{influencer.followersAge || influencer.followers_age}</div>
              )}
            </div>

            <div>
              <Label htmlFor="followersSex">Followers Gender</Label>
              {isEditing ? (
                <Select
                  value={formData.followersSex || formData.followers_sex}
                  onValueChange={(value) => handleSelectChange("followersSex", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender distribution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mixed">Mixed/Balanced</SelectItem>
                    <SelectItem value="Mostly Male">Mostly Male</SelectItem>
                    <SelectItem value="Mostly Female">Mostly Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>{influencer.followersSex || influencer.followers_sex}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {category}
                {isEditing && (
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveCategory(category)} />
                )}
              </Badge>
            ))}

            {isEditing && (
              <div className="flex items-center gap-2 mt-2 w-full">
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
                <Button variant="outline" size="sm" onClick={handleAddCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Brands Worked With</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.brands_worked_with?.map((brand, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {brand}
                {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveBrand(brand)} />}
              </Badge>
            ))}

            {isEditing && (
              <div className="flex items-center gap-2 mt-2 w-full">
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
                <Button variant="outline" size="sm" onClick={handleAddBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {isEditing ? (
          <TagManager
            tags={formData.tags || []}
            onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            placeholder="Add tags like 'US-based', 'top performer'..."
          />
        ) : (
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {influencer.tags && influencer.tags.length > 0 ? (
                influencer.tags.map((tag, index) => (
                  <Badge key={index} variant="default" className="text-sm">
                    {tag}
                  </Badge>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">No tags added</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
