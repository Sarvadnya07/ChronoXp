module.exports=[24380,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(3130),e=a.i(40695),f=a.i(21958),g=a.i(41675),h=a.i(24669);let i=(0,a.i(60137).default)("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);var j=a.i(73570),k=a.i(50429),l=a.i(8406),m=a.i(88431),n=a.i(8706);let o={async generateMonthlyRetro(a,b,c){let d=`${b}-${c.toString().padStart(2,"0")}-01`,e=new Date(b,c,0).toISOString().split("T")[0],f=await n.db.getDailyProgressRange(d,e),g={totalXP:(await n.db.getAll("xpLogs")).filter(a=>a.date.startsWith(`${b}-${c.toString().padStart(2,"0")}`)).reduce((a,b)=>a+b.xp,0),tasksCompleted:f.reduce((a,b)=>a+b.completedTasks,0),avgSleepHours:this.calculateAvgSleep(f),avgMood:this.calculateAvgMood(f),streakMaintained:this.checkStreakMaintained(f),burnoutPeaks:this.countBurnoutPeaks(f)},h=`
You are an AI life coach analyzing a user's entire month of productivity data.

**Month**: ${this.getMonthName(c)} ${b}

**Key Metrics**:
- Total XP Earned: ${g.totalXP}
- Tasks Completed: ${g.tasksCompleted}
- Average Sleep: ${g.avgSleepHours.toFixed(1)} hours
- Average Mood: ${g.avgMood.toFixed(1)}/5
- Streak Maintained: ${g.streakMaintained?"Yes":"No"}
- Burnout Risk Peaks: ${g.burnoutPeaks}

**Daily Breakdown**:
${f.map(a=>`${a.date}: ${a.completedTasks}/${a.tasks.length} tasks, Mood: ${a.mood||"N/A"}, XP: ${a.totalXP}`).join("\n")}

**Tasks Completed**: Provide a comprehensive retrospective with:

1. **Summary** (3-4 sentences): Overall month performance
2. **Wins** (array of 3-5 strings): Major accomplishments and positive patterns
3. **Failures** (array of 2-4 strings): Missed goals, negative patterns
4. **Stagnations** (array of 1-3 strings): Areas with no progress
5. **Suggestions** (array of 4-6 strings): Actionable improvements
6. **Next 30-Day Plan** (paragraph): Strategic roadmap for next month
7. **Habit Restructuring** (array of 2-3 objects): Specific habit changes needed

**IMPORTANT**: Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "string",
  "wins": ["string", "string", ...],
  "failures": ["string", "string", ...],
  "stagnations": ["string", ...],
  "suggestions": ["string", ...],
  "next30DayPlan": "string",
  "habitRestructuring": [
    {
      "type": "increase_difficulty" | "decrease_difficulty" | "new_habit",
      "message": "string",
      "reason": "string"
    }
  ]
}
`;try{let d=(await m.GeminiService.askGemini(h)).replace(/```json/g,"").replace(/```/g,"").trim(),e=JSON.parse(d);return{id:`retro-${b}-${c}-${Date.now()}`,userId:a,year:b,month:c,summary:e.summary,wins:e.wins,failures:e.failures,stagnations:e.stagnations,suggestions:e.suggestions,next30DayPlan:e.next30DayPlan,habitRestructuring:e.habitRestructuring.map((a,b)=>({...a,id:`habit-${Date.now()}-${b}`,createdAt:Date.now()})),metrics:g,createdAt:Date.now()}}catch(d){return console.error("Failed to generate monthly retrospective:",d),this.createFallbackMonthly(a,b,c,g)}},async generateQuarterlyRetro(a,b,c){let d=(c-1)*3+1,e=[d,d+1,d+2],f=await Promise.all(e.map(c=>this.generateMonthlyRetro(a,b,c))),g=`
You are a deep psychological AI analyst examining a user's entire QUARTER of life and productivity data.

**Quarter**: Q${c} ${b} (Months: ${e.join(", ")})

**Monthly Summaries**:
${f.map((a,b)=>`
Month ${e[b]}:
- Summary: ${a.summary}
- XP: ${a.metrics.totalXP}
- Tasks: ${a.metrics.tasksCompleted}
- Wins: ${a.wins.join(", ")}
- Failures: ${a.failures.join(", ")}
`).join("\n")}

**Quarter Totals**:
- Total XP: ${f.reduce((a,b)=>a+b.metrics.totalXP,0)}
- Total Tasks: ${f.reduce((a,b)=>a+b.metrics.tasksCompleted,0)}

Provide a DEEP, quarter-long analysis with:

1. **Psychological Insights** (2 paragraphs): Deep patterns, motivations, underlying issues
2. **Strengths** (array of 4-6): Core strengths demonstrated
3. **Weaknesses** (array of 3-5): Areas needing significant work
4. **Long-Term Trajectory** (paragraph): Where is the user headed? Extrapolate 1-2 years
5. **Paradigm Shifts** (array of 2-4): Major mindset/approach changes needed
6. **Life Direction Analysis** (paragraph): Philosophical advice on purpose, priorities, and growth

**IMPORTANT**: Return ONLY valid JSON (no markdown):
{
  "psychologicalInsights": "string",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "longTermTrajectory": "string",
  "paradigmShifts": ["string", ...],
  "lifeDirectionAnalysis": "string"
}
`;try{let a=(await m.GeminiService.askGemini(g)).replace(/```json/g,"").replace(/```/g,"").trim(),d=JSON.parse(a);return{...f[0],id:`retro-Q${c}-${b}-${Date.now()}`,quarter:c,metrics:{totalXP:f.reduce((a,b)=>a+b.metrics.totalXP,0),tasksCompleted:f.reduce((a,b)=>a+b.metrics.tasksCompleted,0),avgSleepHours:f.reduce((a,b)=>a+b.metrics.avgSleepHours,0)/3,avgMood:f.reduce((a,b)=>a+b.metrics.avgMood,0)/3,streakMaintained:f.every(a=>a.metrics.streakMaintained),burnoutPeaks:f.reduce((a,b)=>a+b.metrics.burnoutPeaks,0)},psychologicalInsights:d.psychologicalInsights,strengthsWeaknesses:{strengths:d.strengths,weaknesses:d.weaknesses},longTermTrajectory:d.longTermTrajectory,paradigmShifts:d.paradigmShifts,lifeDirectionAnalysis:d.lifeDirectionAnalysis}}catch(a){throw console.error("Failed to generate quarterly retrospective:",a),a}},calculateAvgSleep(a){let b=a.filter(a=>a.sleep?.totalHours).map(a=>a.sleep.totalHours);return b.length>0?b.reduce((a,b)=>a+b,0)/b.length:0},calculateAvgMood(a){let b=a.filter(a=>a.mood).map(a=>a.mood);return b.length>0?b.reduce((a,b)=>a+b,0)/b.length:3},checkStreakMaintained:a=>a.every(a=>a.completedTasks>=.7*a.tasks.length),countBurnoutPeaks:a=>a.filter(a=>a.mood&&a.mood<2||a.completedTasks<.5*a.tasks.length).length,getMonthName:a=>["January","February","March","April","May","June","July","August","September","October","November","December"][a-1],createFallbackMonthly:(a,b,c,d)=>({id:`retro-${b}-${c}-${Date.now()}`,userId:a,year:b,month:c,summary:`Completed ${d.tasksCompleted} tasks with ${d.totalXP} XP earned.`,wins:["Maintained consistency"],failures:[],stagnations:[],suggestions:["Continue current momentum"],next30DayPlan:"Focus on maintaining current performance levels.",habitRestructuring:[],metrics:d,createdAt:Date.now()})};var p=a.i(45404);function q(){let{user:a}=(0,p.useAuth)(),[m,n]=(0,c.useState)(!1),[q,r]=(0,c.useState)(null),[s,t]=(0,c.useState)(null),[u,v]=(0,c.useState)(new Date().getMonth()+1),[w,x]=(0,c.useState)(new Date().getFullYear()),[y,z]=(0,c.useState)(Math.ceil((new Date().getMonth()+1)/3)),A=async()=>{if(a){n(!0);try{let b=await o.generateMonthlyRetro(a.uid,w,u);r(b)}catch(a){console.error("Failed to generate monthly retrospective:",a)}finally{n(!1)}}},B=async()=>{if(a){n(!0);try{let b=await o.generateQuarterlyRetro(a.uid,w,y);t(b)}catch(a){console.error("Failed to generate quarterly retrospective:",a)}finally{n(!1)}}};return(0,b.jsxs)("div",{className:"container mx-auto p-6 space-y-6",children:[(0,b.jsx)("div",{className:"flex justify-between items-center",children:(0,b.jsxs)("div",{children:[(0,b.jsx)("h1",{className:"text-3xl font-bold",children:"📊 AI Retrospectives"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"Deep AI-powered analysis of your productivity journey"})]})}),(0,b.jsxs)(f.Tabs,{defaultValue:"monthly",className:"w-full",children:[(0,b.jsxs)(f.TabsList,{children:[(0,b.jsx)(f.TabsTrigger,{value:"monthly",children:"Monthly"}),(0,b.jsx)(f.TabsTrigger,{value:"quarterly",children:"Quarterly"})]}),(0,b.jsxs)(f.TabsContent,{value:"monthly",className:"space-y-6",children:[(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{children:"Generate Monthly Retrospective"})}),(0,b.jsx)(d.CardContent,{className:"space-y-4",children:(0,b.jsxs)("div",{className:"flex gap-4",children:[(0,b.jsx)("select",{value:u,onChange:a=>v(parseInt(a.target.value)),className:"p-2 border rounded",children:Array.from({length:12},(a,c)=>(0,b.jsx)("option",{value:c+1,children:new Date(2e3,c).toLocaleString("default",{month:"long"})},c))}),(0,b.jsx)("select",{value:w,onChange:a=>x(parseInt(a.target.value)),className:"p-2 border rounded",children:Array.from({length:5},(a,c)=>(0,b.jsx)("option",{value:new Date().getFullYear()-c,children:new Date().getFullYear()-c},c))}),(0,b.jsx)(e.Button,{onClick:A,disabled:m,children:m?"Generating...":"Generate Analysis"})]})})]}),q&&(0,b.jsxs)("div",{className:"space-y-4",children:[(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsxs)(d.CardTitle,{className:"flex items-center gap-2",children:[(0,b.jsx)(g.Calendar,{className:"h-5 w-5"}),"Monthly Summary"]})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("p",{className:"text-lg",children:q.summary})})]}),(0,b.jsxs)("div",{className:"grid gap-4 md:grid-cols-3",children:[(0,b.jsx)(d.Card,{children:(0,b.jsx)(d.CardContent,{className:"pt-6",children:(0,b.jsxs)("div",{className:"text-center",children:[(0,b.jsx)("p",{className:"text-3xl font-bold text-primary",children:q.metrics.totalXP}),(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:"Total XP"})]})})}),(0,b.jsx)(d.Card,{children:(0,b.jsx)(d.CardContent,{className:"pt-6",children:(0,b.jsxs)("div",{className:"text-center",children:[(0,b.jsx)("p",{className:"text-3xl font-bold text-green-500",children:q.metrics.tasksCompleted}),(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:"Tasks Completed"})]})})}),(0,b.jsx)(d.Card,{children:(0,b.jsx)(d.CardContent,{className:"pt-6",children:(0,b.jsxs)("div",{className:"text-center",children:[(0,b.jsxs)("p",{className:"text-3xl font-bold text-blue-500",children:[q.metrics.avgSleepHours.toFixed(1),"h"]}),(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:"Avg Sleep"})]})})})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsxs)(d.CardTitle,{className:"flex items-center gap-2",children:[(0,b.jsx)(i,{className:"h-5 w-5 text-yellow-500"}),"Wins"]})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-2",children:q.wins.map((a,c)=>(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("span",{className:"text-green-500",children:"✓"}),(0,b.jsx)("span",{children:a})]},c))})})]}),(0,b.jsxs)("div",{className:"grid gap-4 md:grid-cols-2",children:[(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsxs)(d.CardTitle,{className:"flex items-center gap-2",children:[(0,b.jsx)(j.AlertTriangle,{className:"h-5 w-5 text-red-500"}),"Areas to Improve"]})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-2",children:q.failures.map((a,c)=>(0,b.jsxs)("li",{className:"text-sm text-muted-foreground",children:["• ",a]},c))})})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsxs)(d.CardTitle,{className:"flex items-center gap-2",children:[(0,b.jsx)(h.TrendingUp,{className:"h-5 w-5 text-orange-500"}),"Stagnations"]})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-2",children:q.stagnations.map((a,c)=>(0,b.jsxs)("li",{className:"text-sm text-muted-foreground",children:["• ",a]},c))})})]})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsxs)(d.CardTitle,{className:"flex items-center gap-2",children:[(0,b.jsx)(l.Sparkles,{className:"h-5 w-5 text-purple-500"}),"AI Recommendations"]})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-2",children:q.suggestions.map((a,c)=>(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("span",{className:"text-purple-500",children:"→"}),(0,b.jsx)("span",{children:a})]},c))})})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsxs)(d.CardTitle,{className:"flex items-center gap-2",children:[(0,b.jsx)(k.Target,{className:"h-5 w-5 text-blue-500"}),"Next 30-Day Plan"]})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("p",{className:"whitespace-pre-line",children:q.next30DayPlan})})]})]})]}),(0,b.jsxs)(f.TabsContent,{value:"quarterly",className:"space-y-6",children:[(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{children:"Generate Quarterly Retrospective"})}),(0,b.jsx)(d.CardContent,{className:"space-y-4",children:(0,b.jsxs)("div",{className:"flex gap-4",children:[(0,b.jsx)("select",{value:y,onChange:a=>z(parseInt(a.target.value)),className:"p-2 border rounded",children:[1,2,3,4].map(a=>(0,b.jsxs)("option",{value:a,children:["Q",a]},a))}),(0,b.jsx)("select",{value:w,onChange:a=>x(parseInt(a.target.value)),className:"p-2 border rounded",children:Array.from({length:5},(a,c)=>(0,b.jsx)("option",{value:new Date().getFullYear()-c,children:new Date().getFullYear()-c},c))}),(0,b.jsx)(e.Button,{onClick:B,disabled:m,children:m?"Generating...":"Generate Deep Analysis"})]})})]}),s&&(0,b.jsxs)("div",{className:"space-y-4",children:[(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{children:"🧠 Psychological Insights"})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("p",{className:"whitespace-pre-line text-lg leading-relaxed",children:s.psychologicalInsights})})]}),(0,b.jsxs)("div",{className:"grid gap-4 md:grid-cols-2",children:[(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{className:"text-green-500",children:"💪 Strengths"})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-2",children:s.strengthsWeaknesses.strengths.map((a,c)=>(0,b.jsxs)("li",{children:["✓ ",a]},c))})})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{className:"text-orange-500",children:"⚠️ Weaknesses"})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-2",children:s.strengthsWeaknesses.weaknesses.map((a,c)=>(0,b.jsxs)("li",{children:["• ",a]},c))})})]})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{children:"🎯 Long-Term Trajectory"})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("p",{className:"whitespace-pre-line",children:s.longTermTrajectory})})]}),(0,b.jsxs)(d.Card,{children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{children:"🔄 Paradigm Shifts Needed"})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("ul",{className:"space-y-3",children:s.paradigmShifts.map((a,c)=>(0,b.jsx)("li",{className:"p-3 bg-primary/5 rounded border-l-4 border-primary",children:a},c))})})]}),(0,b.jsxs)(d.Card,{className:"border-2 border-primary",children:[(0,b.jsx)(d.CardHeader,{children:(0,b.jsx)(d.CardTitle,{children:"🌟 Life Direction Analysis"})}),(0,b.jsx)(d.CardContent,{children:(0,b.jsx)("p",{className:"whitespace-pre-line text-lg leading-relaxed",children:s.lifeDirectionAnalysis})})]})]})]})]})]})}a.s(["default",()=>q],24380)}];

//# sourceMappingURL=app_retrospective_page_tsx_48aa115f._.js.map