"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { X, Plus, Tag, Sparkles } from "lucide-react"

interface TagManagerProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  allExistingTags?: string[] // Tags from other influencers for suggestions
  placeholder?: string
  className?: string
}

// Predefined popular tags for suggestions
const SUGGESTED_TAGS = [
  // Performance-based
  "top performer",
  "high engagement",
  "viral content",
  "consistent posting",
  "growing audience",
  
  // Location-based
  "US-based",
  // "UK-based",
  // "EU-based",
  // "Canada-based",
  // "Australia-based",
  "global reach",
  
  // Demographics
  "Gen Z audience",
  "millennial audience",
  "female audience",
  "male audience",
  "family friendly",
  
  // Content style
  "authentic content",
  "professional content",
  "lifestyle content",
  "educational content",
  "entertainment content",
  "UGC creator",
  
  // Niche expertise
  "fashion influencer",
  "beauty influencer",
  "fitness influencer",
  "food influencer",
  "travel influencer",
  "tech influencer",
  "gaming influencer",
  "parenting influencer",
  
  // Collaboration style
  "easy to work with",
  "responsive",
  "creative",
  "professional",
  "reliable",
  "flexible rates",
  
  // Platform specific
  "Instagram focused",
  "TikTok focused",
  "YouTube focused",
  "multi-platform",
  
  // Business related
  "brand safe",
  "long-term partner",
  "exclusive content",
  "product reviews",
  "sponsored posts",
  "affiliate marketing"
]

export function TagManager({ tags, onTagsChange, allExistingTags = [], placeholder = "Add tags...", className }: TagManagerProps) {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Combine suggested tags with existing tags from other influencers
  const allSuggestions = useMemo(() => {
    const combined = [...SUGGESTED_TAGS, ...allExistingTags]
    return Array.from(new Set(combined)).sort()
  }, [allExistingTags])

  // Filter suggestions based on input and exclude already selected tags
  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return allSuggestions.filter(tag => !tags.includes(tag))
    
    return allSuggestions.filter(tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase()) && 
      !tags.includes(tag)
    )
  }, [inputValue, tags, allSuggestions])

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
      setInputValue("")
      setIsOpen(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      handleAddTag(inputValue)
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setIsOpen(value.length > 0 || filteredSuggestions.length > 0)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Tag className="h-4 w-4" />
          Tags
        </Label>
        <Badge variant="outline" className="text-xs">
          {tags.length}
        </Badge>
      </div>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add New Tag */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              onBlur={(e) => {
                // Delay closing to allow for clicks on suggestions
                setTimeout(() => setIsOpen(false), 200)
              }}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => inputValue.trim() && handleAddTag(inputValue)}
              disabled={!inputValue.trim()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Popover positioned relative to input */}
        {isOpen && (filteredSuggestions.length > 0 || inputValue.trim()) && (
          <div 
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                <CommandEmpty>
                  {inputValue.trim() ? (
                    <div className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddTag(inputValue)}
                        className="text-sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create "{inputValue}"
                      </Button>
                    </div>
                  ) : (
                    "No tags found"
                  )}
                </CommandEmpty>
                
                {filteredSuggestions.length > 0 && (
                  <CommandGroup heading="Suggested Tags" className="p-2">
                    {filteredSuggestions.slice(0, 10).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => handleAddTag(tag)}
                        className="cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 mr-2 text-muted-foreground" />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        )}
      </div>

      {/* Quick Add Popular Tags */}
      {tags.length === 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Popular tags:</Label>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_TAGS.slice(0, 8).map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => handleAddTag(tag)}
              >
                <Plus className="h-2 w-2 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 