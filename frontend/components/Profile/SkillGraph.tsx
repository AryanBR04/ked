import React from "react";

interface Skill {
  name: string;
  progress: number;
}

interface SkillGraphProps {
  skills: Skill[];
}

export function SkillGraph({ skills }: SkillGraphProps) {
  if (skills.length === 0) return null;

  return (
    <div className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft">
      <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Skill Progress</p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">Expertise breakdown</h2>
      
      <div className="mt-8 space-y-6">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-ink/85">{skill.name}</span>
              <span className="text-moss">{skill.progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-moss/5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-moss to-moss/60 transition-all duration-1000 ease-out"
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
