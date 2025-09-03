import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  searchQuery: string;
  stageFilter: string;
  classFilter: string;
  onSearchChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onClassChange: (value: string) => void;
  searchId?: string;
  stageId?: string;
  classId?: string;
}

const Filters: React.FC<FiltersProps> = ({
  searchQuery,
  stageFilter,
  classFilter,
  onSearchChange,
  onStageChange,
  onClassChange,
  searchId = "enquiry-search",
  stageId = "enquiry-stage",
  classId = "enquiry-class",
}) => (
  <form
    className="flex flex-wrap gap-2 items-center"
    onSubmit={(e) => e.preventDefault()}
  >
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        id={searchId}
        name="search"
        placeholder="Search by name, guardian, or phone..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
        autoComplete="on"
        autoFocus
      />
    </div>

    <Select name="stage" value={stageFilter} onValueChange={onStageChange}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="All Stages" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Stages</SelectItem>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="contacted">Contacted</SelectItem>
        <SelectItem value="scheduled">Scheduled</SelectItem>
        <SelectItem value="admitted">Admitted</SelectItem>
        <SelectItem value="lost">Lost</SelectItem>
      </SelectContent>
    </Select>

    <Select name="class" value={classFilter} onValueChange={onClassChange}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="All Classes" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Classes</SelectItem>
        <SelectItem value="Pre-K">Pre-K</SelectItem>
        <SelectItem value="Kindergarten">Kindergarten</SelectItem>
        <SelectItem value="Grade 1">Grade 1</SelectItem>
        <SelectItem value="Grade 2">Grade 2</SelectItem>
        <SelectItem value="Grade 3">Grade 3</SelectItem>
        <SelectItem value="Grade 4">Grade 4</SelectItem>
        <SelectItem value="Grade 5">Grade 5</SelectItem>
        <SelectItem value="Grade 6">Grade 6</SelectItem>
        <SelectItem value="Grade 7">Grade 7</SelectItem>
        <SelectItem value="Grade 8">Grade 8</SelectItem>
        <SelectItem value="Grade 9">Grade 9</SelectItem>
        <SelectItem value="Grade 10">Grade 10</SelectItem>
        <SelectItem value="Grade 11">Grade 11</SelectItem>
        <SelectItem value="Grade 12">Grade 12</SelectItem>
      </SelectContent>
    </Select>
  </form>
);

export default Filters;
