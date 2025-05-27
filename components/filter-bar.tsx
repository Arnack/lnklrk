"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Influencer } from "@/types/influencer"
import { Filter, X } from "lucide-react"

interface FilterBarProps {
  influencers: Influencer[]
  onFilterChange: (filtered: Influencer[]) => void
}

export function FilterBar({ influencers, onFilterChange }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [followerRange, setFollowerRange] = useState<[number, number]>([0, 10000000])
  const [selectedGender, setSelectedGender] = useState<string>("")
  const [selectedAge, setSelectedAge] = useState<string>("")

  // Extract unique values for filters
  const platforms = [...new Set(influencers.map((inf) => inf.platform))]
  const categories = [...new Set(influencers.flatMap((inf) => inf.categories))]
  const genders = ["Male-dominant", "Female-dominant", "Balanced"]
  const ageGroups = ["13-17", "18-24", "25-34", "35-44", "45+"]

  // Find min and max followers
  const minFollowers = Math.min(...influencers.map((inf) => inf.followers), 0)
  const maxFollowers = Math.max(...influencers.map((inf) => inf.followers), 10000000)

  useEffect(() => {
    setFollowerRange([minFollowers, maxFollowers])
  }, [minFollowers, maxFollowers])

  useEffect(() => {
    let filtered = [...influencers]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (inf) =>
          inf.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.profileLink.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by platforms
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((inf) => selectedPlatforms.includes(inf.platform))
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((inf) => inf.categories.some((cat) => selectedCategories.includes(cat)))
    }

    // Filter by follower range
    filtered = filtered.filter((inf) => inf.followers >= followerRange[0] && inf.followers <= followerRange[1])

    // Filter by gender
    if (selectedGender) {
      filtered = filtered.filter((inf) => inf.followersSex.includes(selectedGender))
    }

    // Filter by age
    if (selectedAge) {
      filtered = filtered.filter((inf) => inf.followersAge.includes(selectedAge))
    }

    onFilterChange(filtered)
  }, [influencers, searchTerm, selectedPlatforms, selectedCategories, followerRange, selectedGender, selectedAge])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPlatforms([])
    setSelectedCategories([])
    setFollowerRange([minFollowers, maxFollowers])
    setSelectedGender("")
    setSelectedAge("")
  }

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by handle or profile link..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Platform
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform])
                        } else {
                          setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
                        }
                      }}
                    />
                    <Label htmlFor={`platform-${platform}`}>{platform}</Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Category
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category])
                        } else {
                          setSelectedCategories(selectedCategories.filter((c) => c !== category))
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Followers
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{formatFollowerCount(followerRange[0])}</span>
                  <span>{formatFollowerCount(followerRange[1])}</span>
                </div>
                <Slider
                  defaultValue={[minFollowers, maxFollowers]}
                  min={minFollowers}
                  max={maxFollowers}
                  step={1000}
                  value={followerRange}
                  onValueChange={(value) => setFollowerRange(value as [number, number])}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Audience Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAge} onValueChange={setSelectedAge}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Audience Age" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              {ageGroups.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2">
        {selectedPlatforms.map((platform) => (
          <Badge key={platform} variant="secondary" className="flex items-center gap-1">
            {platform}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))}
            />
          </Badge>
        ))}

        {selectedCategories.map((category) => (
          <Badge key={category} variant="secondary" className="flex items-center gap-1">
            {category}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== category))}
            />
          </Badge>
        ))}

        {selectedGender && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {selectedGender}
            <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedGender("")} />
          </Badge>
        )}

        {selectedAge && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Age: {selectedAge}
            <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedAge("")} />
          </Badge>
        )}
      </div>
    </div>
  )
}
