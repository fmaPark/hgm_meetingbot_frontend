"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Search, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { MeetingFilters } from "@/lib/meeting-types"
import { PROJECTS, PARTS } from "@/lib/meeting-types"

interface MeetingFilterBarProps {
  filters: MeetingFilters
  onFiltersChange: (filters: MeetingFilters) => void
  hasDeletePermission?: boolean
  onTrashClick?: () => void
}

export function MeetingFilterBar({
  filters,
  onFiltersChange,
  hasDeletePermission = false,
  onTrashClick,
}: MeetingFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local search with external filter changes (e.g. reset)
  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value })
      }, 300)
    },
    [filters, onFiltersChange]
  )

  const handleClearSearch = useCallback(() => {
    setLocalSearch("")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onFiltersChange({ ...filters, search: "" })
  }, [filters, onFiltersChange])

  const handleProjectChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, project: value })
    },
    [filters, onFiltersChange]
  )

  const handlePartChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, part: value })
    },
    [filters, onFiltersChange]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card">
      {/* Desktop Layout */}
      <div className="hidden h-[65px] items-center gap-4 px-4 md:flex">
        <Select value={filters.project} onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="전체 프로젝트" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 프로젝트</SelectItem>
            {PROJECTS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.part} onValueChange={handlePartChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="전체 파트" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 파트</SelectItem>
            {PARTS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input */}
        <div className="relative max-w-[400px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="제목, 내용으로 검색"
            className="h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground"
              aria-label="검색어 지우기"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {hasDeletePermission && (
          <Button
            variant="outline"
            onClick={onTrashClick}
            className="ml-auto gap-2"
          >
            <Trash2 className="size-4" />
            휴지통
          </Button>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-2 p-4 md:hidden">
        {/* Row 1: Project + Part selects */}
        <div className="flex gap-2">
          <Select value={filters.project} onValueChange={handleProjectChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="전체 프로젝트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 프로젝트</SelectItem>
              {PROJECTS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.part} onValueChange={handlePartChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="전체 파트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 파트</SelectItem>
              {PARTS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Search + Trash */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="제목, 내용으로 검색"
              className="h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground"
                aria-label="검색어 지우기"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {hasDeletePermission && (
            <Button
              variant="outline"
              size="icon"
              onClick={onTrashClick}
              className="w-10 shrink-0"
              aria-label="휴지통"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
