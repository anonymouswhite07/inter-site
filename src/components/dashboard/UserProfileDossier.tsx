"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface UserProfileDossierProps {
  userId: string;
}

export function UserProfileDossier({ userId }: UserProfileDossierProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable Form State variables
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [skillsText, setSkillsText] = useState("");

  // Document Upload States
  const [resume, setResume] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [offerLetter, setOfferLetter] = useState("");

  // Admin-Only Editable Fields
  const [internshipDomain, setInternshipDomain] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [duration, setDuration] = useState("");

  const isOwner = session?.user?.id === userId;
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const canEdit = isOwner || isAdmin;

  // Load profile data
  useEffect(() => {
    setLoading(true);
    setIsEditing(false);
    fetch(`/api/profile?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
          // Pre-fill edit inputs
          setFullName(data.data.name || "");
          setPhone(data.data.personalInfo?.phoneNumber || "");
          setCollege(data.data.personalInfo?.collegeName || "");
          setDepartment(data.data.personalInfo?.department || "");
          setYear(data.data.personalInfo?.year || "");
          setLocation(data.data.personalInfo?.location || "");
          setGithub(data.data.socialLinks?.github || "");
          setLinkedin(data.data.socialLinks?.linkedin || "");
          setPortfolio(data.data.socialLinks?.portfolio || "");
          setSkillsText(data.data.skills?.join(", ") || "");
          setInternshipDomain(data.data.internshipDetails?.domain || "");
          setMentorName(data.data.internshipDetails?.mentorName || "");
          setDuration(data.data.internshipDetails?.duration || "");
          setResume(data.data.documents?.resume || "");
          setCollegeId(data.data.documents?.collegeId || "");
          setOfferLetter(data.data.documents?.offerLetter || "");
        } else {
          toast.error("Failed to load profile");
        }
      })
      .catch(() => toast.error("Error connecting to profile registry"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedData = {
      userId,
      name: fullName,
      skills: skillsText.split(",").map(s => s.trim()).filter(Boolean),
      personalInfo: {
        phoneNumber: phone,
        collegeName: college,
        department,
        year,
        location,
      },
      socialLinks: {
        github,
        linkedin,
        portfolio,
      },
      documents: {
        resume,
        collegeId,
        offerLetter,
      },
      // Admin only values
      internshipDetails: isAdmin ? {
        domain: internshipDomain,
        mentorName,
        duration,
      } : undefined,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile dossier saved!");
        setIsEditing(false);
        // Refresh local data
        setProfile((prev: any) => ({
          ...prev,
          name: fullName,
          skills: updatedData.skills,
          personalInfo: {
            ...prev.personalInfo,
            ...updatedData.personalInfo,
          },
          socialLinks: {
            ...prev.socialLinks,
            ...updatedData.socialLinks,
          },
          documents: {
            ...prev.documents,
            ...updatedData.documents,
          },
          internshipDetails: isAdmin ? {
            ...prev.internshipDetails,
            ...updatedData.internshipDetails,
          } : prev.internshipDetails,
        }));
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Network error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] rounded border">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
        <p>Fetching credentials...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="fluent-card p-5 space-y-6 bg-[hsl(var(--card))] select-none">
      
      {/* 📸 Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded border bg-[hsl(var(--background))]">
        <Avatar className="h-16 w-16 rounded-full ring-2 ring-[hsl(var(--primary)/0.2)]">
          <AvatarFallback className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-lg font-bold">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            {isEditing ? (
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="fluent-input h-7 text-xs max-w-[200px]"
                placeholder="Full Name"
              />
            ) : (
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">{profile.name}</h3>
            )}
            <div className="flex items-center gap-1.5 justify-center">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                Active 🟢
              </span>
            </div>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{profile.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            <Badge variant="outline" className="text-[8px] h-4.5 font-bold uppercase tracking-wider">
              {profile.role}
            </Badge>
            {profile.progress.attendance !== "0 Days" && (
              <Badge className="text-[8px] h-4.5 font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white">
                Top Performer 🏆
              </Badge>
            )}
          </div>
        </div>
        
        {/* Completion bar */}
        <div className="w-full sm:w-28 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold">
            <span className="text-[hsl(var(--muted-foreground))]">Completion</span>
            <span className="text-[hsl(var(--primary))]">{profile.completionPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[hsl(var(--primary))] transition-all duration-300"
              style={{ width: `${profile.completionPercent}%` }}
            />
          </div>
        </div>

        {canEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-7 text-[10px] px-2.5 rounded hover:bg-[hsl(var(--accent))] mt-2 sm:mt-0"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        )}
      </div>

      {/* Grid fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        
        {/* 👤 Personal Information */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] border-b pb-1">
            👤 Personal Information
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Register Number</span>
              <span className="font-semibold font-mono">{profile.personalInfo.registerNumber}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">College / Institution</span>
              {isEditing ? (
                <Input value={college} onChange={(e) => setCollege(e.target.value)} className="fluent-input h-7 text-xs" />
              ) : (
                <span className="font-semibold">{profile.personalInfo.collegeName || "Not Configured"}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Department</span>
                {isEditing ? (
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="fluent-input h-7 text-xs" />
                ) : (
                  <span className="font-semibold">{profile.personalInfo.department || "Not Configured"}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Academic Year</span>
                {isEditing ? (
                  <Input value={year} onChange={(e) => setYear(e.target.value)} className="fluent-input h-7 text-xs" />
                ) : (
                  <span className="font-semibold">{profile.personalInfo.year || "Not Configured"}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Phone Number</span>
                {isEditing ? (
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="fluent-input h-7 text-xs" />
                ) : (
                  <span className="font-semibold">{profile.personalInfo.phoneNumber || "Not Configured"}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">City / Region</span>
                {isEditing ? (
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="fluent-input h-7 text-xs" />
                ) : (
                  <span className="font-semibold">{profile.personalInfo.location || "Not Configured"}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 💼 Internship Details */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] border-b pb-1">
            💼 Internship Details
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Company Partner</span>
              <span className="font-semibold">{profile.internshipDetails.companyName}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Domain Specialization</span>
              {isEditing && isAdmin ? (
                <Input value={internshipDomain} onChange={(e) => setInternshipDomain(e.target.value)} className="fluent-input h-7 text-xs" />
              ) : (
                <span className="font-semibold">{profile.internshipDetails.domain}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Assigned Mentor Lead</span>
              {isEditing && isAdmin ? (
                <Input value={mentorName} onChange={(e) => setMentorName(e.target.value)} className="fluent-input h-7 text-xs" />
              ) : (
                <span className="font-semibold">{profile.internshipDetails.mentorName}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Duration</span>
                {isEditing && isAdmin ? (
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} className="fluent-input h-7 text-xs" />
                ) : (
                  <span className="font-semibold">{profile.internshipDetails.duration}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Status</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{profile.internshipDetails.status}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Progress Metrics & Skills */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* 📊 Progress */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] border-b pb-1">
            📊 Progress Metrics
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Tasks Completed:</span> <span className="font-semibold font-mono">{profile.progress.tasksCompleted}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Attendance logs:</span> <span className="font-semibold">{profile.progress.attendance}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Hours Worked:</span> <span className="font-semibold font-mono">{profile.progress.hoursWorked}</span></div>
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Streak Status:</span> <span className="font-semibold text-[hsl(var(--primary))] font-mono">{profile.progress.currentStreak}</span></div>
          </div>
        </div>

        {/* 🧠 Skills & Achievements */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">🧠 Skills Inventory</span>
            {isEditing ? (
              <Input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="fluent-input h-7 text-xs mt-1"
                placeholder="HTML, CSS, JavaScript"
              />
            ) : (
              <div className="flex flex-wrap gap-1 pt-1">
                {profile.skills.length === 0 ? (
                  <span className="text-xs text-[hsl(var(--muted-foreground))] italic">No skills listed yet</span>
                ) : (
                  profile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0.5 rounded-sm">
                      {skill}
                    </Badge>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔗 Social Links & Documents */}
      <div className="grid gap-5 sm:grid-cols-2 border-t pt-4">
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            🔗 Social Links
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] text-[hsl(var(--muted-foreground))]">GitHub:</span>
              {isEditing ? (
                <Input value={github} onChange={(e) => setGithub(e.target.value)} className="fluent-input h-7 text-xs flex-1" />
              ) : profile.socialLinks.github ? (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="font-semibold text-[hsl(var(--primary))] hover:underline truncate">
                  {profile.socialLinks.github}
                </a>
              ) : (
                <span className="text-[hsl(var(--muted-foreground))] italic">Not Configured</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] text-[hsl(var(--muted-foreground))]">LinkedIn:</span>
              {isEditing ? (
                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="fluent-input h-7 text-xs flex-1" />
              ) : profile.socialLinks.linkedin ? (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-[hsl(var(--primary))] hover:underline truncate">
                  {profile.socialLinks.linkedin}
                </a>
              ) : (
                <span className="text-[hsl(var(--muted-foreground))] italic">Not Configured</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] text-[hsl(var(--muted-foreground))]">Portfolio:</span>
              {isEditing ? (
                <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="fluent-input h-7 text-xs flex-1" />
              ) : profile.socialLinks.portfolio ? (
                <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="font-semibold text-[hsl(var(--primary))] hover:underline truncate">
                  {profile.socialLinks.portfolio}
                </a>
              ) : (
                <span className="text-[hsl(var(--muted-foreground))] italic">Not Configured</span>
              )}
            </div>
          </div>
        </div>

        {/* 📂 Documents */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            📂 Verified Documents
          </h4>
          {isEditing ? (
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Resume Link</span>
                <Input value={resume} onChange={(e) => setResume(e.target.value)} placeholder="https://drive.google.com/... or pdf url" className="fluent-input h-7 text-xs" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">College ID Card Link</span>
                <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} placeholder="https://drive.google.com/..." className="fluent-input h-7 text-xs" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Offer Letter Link</span>
                <Input value={offerLetter} onChange={(e) => setOfferLetter(e.target.value)} placeholder="https://drive.google.com/..." className="fluent-input h-7 text-xs" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              {profile.documents.resume ? (
                <a href={profile.documents.resume} target="_blank" rel="noopener noreferrer" className="p-2 border border-green-200 dark:border-green-800/30 rounded hover:bg-green-500/5 transition-colors cursor-pointer text-center font-medium block text-green-600 dark:text-green-400">
                  📄 Open Resume
                </a>
              ) : (
                <div className="p-2 border border-dashed rounded text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--accent))/0.2]">
                  ❌ Resume Missing
                </div>
              )}

              {profile.documents.collegeId ? (
                <a href={profile.documents.collegeId} target="_blank" rel="noopener noreferrer" className="p-2 border border-green-200 dark:border-green-800/30 rounded hover:bg-green-500/5 transition-colors cursor-pointer text-center font-medium block text-green-600 dark:text-green-400">
                  💳 Open College ID
                </a>
              ) : (
                <div className="p-2 border border-dashed rounded text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--accent))/0.2]">
                  ❌ ID Card Missing
                </div>
              )}

              {profile.documents.offerLetter ? (
                <a href={profile.documents.offerLetter} target="_blank" rel="noopener noreferrer" className="p-2 border border-green-200 dark:border-green-800/30 rounded hover:bg-green-500/5 transition-colors cursor-pointer text-center font-medium block text-green-600 dark:text-green-400">
                  💼 Open Offer Letter
                </a>
              ) : (
                <div className="p-2 border border-dashed rounded text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--accent))/0.2]">
                  ❌ Offer Letter Missing
                </div>
              )}

              {profile.documents.certificate ? (
                <div className="p-2 border border-amber-200 dark:border-amber-800/30 rounded hover:bg-amber-500/5 text-amber-600 dark:text-amber-400 text-center font-medium cursor-pointer">
                  🎓 Completion Cert
                </div>
              ) : (
                <div className="p-2 border border-dashed rounded text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--accent))/0.2]">
                  🎓 Pending Completion
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button for editing state */}
      {isEditing && (
        <div className="pt-4 border-t flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="h-8 rounded text-xs"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-8 rounded bg-[hsl(var(--primary))] text-white text-xs font-semibold px-4"
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      )}

    </form>
  );
}
