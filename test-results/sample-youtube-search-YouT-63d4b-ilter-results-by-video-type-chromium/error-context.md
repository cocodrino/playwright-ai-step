# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sample/youtube-search.spec.ts >> YouTube Search >> filter results by video type
- Location: sample/youtube-search.spec.ts:27:2

# Error details

```
Error: ai() selector resolution failed after 9 attempts.
ai() failed to resolve selector after 9 attempts.
  Action: assert
  LLM reasoning: Checking for the 'Videos' filter chip in the search results page to verify it is selected or present.
  LLM confidence: 0.8
  Strategy history:
  - role: ✗ getByRole("", {name:""}) — not visible or not found
  - role: ✗ getByRole("", {name:""}) — not visible or not found
  - text: ✗ getByText("") — not visible or not found
  - text: ✗ getByText("") — not visible or not found
  - testId: ✗ [data-testid=""] — not visible or not found
  - testId: ✗ [data-testid=""] — not visible or not found
  - testId: ✗ [data-testid=""] — not visible or not found
  - css: ✗ ytd-chip-cloud-chip-renderer — not visible or not found
  - css: ✗ ytd-chip-cloud-chip-renderer — not visible or not found
  Closest DOM element: First visible: <body> "if (window.ytcsi) {window.ytcsi.tick('bs', null, '');}ytcfg.set('initialBodyClientWidth', document.body.clientWidth);if (window.ytcsi) {window.ytcsi.tick('ai', null, '');} Back VE Skip navigation Sear…"
  Available strategies: role → text → testId → CSS
  Tip: Add data-testid attributes for stable selectors.
  Instruction: "assert the "Videos" filter is currently selected or highlighted"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - button "Guide" [active] [pressed] [ref=e10] [cursor=pointer]:
          - generic [ref=e13]:
            - img
        - generic [ref=e14]:
          - link "YouTube Home" [ref=e15] [cursor=pointer]:
            - /url: /
            - generic [ref=e20]:
              - img
          - generic [ref=e21]: VE
        - button "Skip navigation" [ref=e25] [cursor=pointer]:
          - generic [ref=e26]: Skip navigation
      - generic [ref=e30]:
        - search [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]:
              - combobox "Search" [expanded] [ref=e35]: golang tutorial
              - button "Clear search query" [ref=e37] [cursor=pointer]:
                - generic [ref=e40]:
                  - img
            - button "Search" [ref=e44] [cursor=pointer]:
              - generic [ref=e47]:
                - img
        - generic [ref=e49]:
          - button "Search with your voice" [ref=e51] [cursor=pointer]:
            - generic [ref=e55]:
              - img
          - tooltip "tooltip"
      - generic [ref=e60]:
        - button "Settings" [ref=e65] [cursor=pointer]:
          - generic [ref=e68]:
            - img
        - link "Sign in" [ref=e71] [cursor=pointer]:
          - /url: https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252Fresults%253Fsearch_query%253Dgolang%252Btutorial&hl=en&ec=65620
          - generic [ref=e75]:
            - img
          - generic [ref=e76]: Sign in
  - navigation [ref=e80]:
    - generic [ref=e84]:
      - generic [ref=e85]:
        - generic "Guide" [ref=e86]:
          - button [pressed] [ref=e87] [cursor=pointer]:
            - generic [ref=e90]:
              - img
        - generic [ref=e91]:
          - link "YouTube Home" [ref=e92] [cursor=pointer]:
            - /url: /
            - generic [ref=e97]:
              - img
          - generic [ref=e98]: VE
      - generic [ref=e100]:
        - generic [ref=e101]:
          - generic [ref=e103]:
            - link "Home" [ref=e105] [cursor=pointer]:
              - /url: /
              - link "Home" [ref=e106]:
                - generic [ref=e109]:
                  - img
                - generic [ref=e110]: Home
            - link "Shorts" [ref=e112] [cursor=pointer]:
              - link "Shorts" [ref=e113]:
                - generic [ref=e116]:
                  - img
                - generic [ref=e117]: Shorts
            - link "Subscriptions" [ref=e119] [cursor=pointer]:
              - /url: /feed/subscriptions
              - link "Subscriptions" [ref=e120]:
                - generic [ref=e123]:
                  - img
                - generic [ref=e124]: Subscriptions
            - link "You" [ref=e126] [cursor=pointer]:
              - /url: /feed/you
              - link "You" [ref=e127]:
                - generic [ref=e130]:
                  - img
                - generic [ref=e131]: You
            - link "History" [ref=e133] [cursor=pointer]:
              - /url: /feed/history
              - link "History" [ref=e134]:
                - generic [ref=e137]:
                  - img
                - generic [ref=e138]: History
          - generic [ref=e139]:
            - generic [ref=e140]: Sign in to like videos, comment, and subscribe.
            - link "Sign in" [ref=e143] [cursor=pointer]:
              - /url: https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252Fresults%253Fsearch_query%253Dgolang%252Btutorial&hl=en
              - generic [ref=e147]:
                - img
              - generic [ref=e148]: Sign in
          - generic [ref=e152]:
            - heading "Explore" [level=3] [ref=e153]:
              - generic [ref=e154]: Explore
            - generic [ref=e155]:
              - link "Music" [ref=e157] [cursor=pointer]:
                - /url: /channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ
                - link "Music" [ref=e158]:
                  - generic [ref=e161]:
                    - img
                  - generic [ref=e162]: Music
              - link "Gaming" [ref=e164] [cursor=pointer]:
                - /url: /gaming
                - link "Gaming" [ref=e165]:
                  - generic [ref=e168]:
                    - img
                  - generic [ref=e169]: Gaming
              - link "Sports" [ref=e171] [cursor=pointer]:
                - /url: /channel/UCEgdi0XIXXZ-qJOFPf4JSKw
                - link "Sports" [ref=e172]:
                  - generic [ref=e175]:
                    - img
                  - generic [ref=e176]: Sports
              - button "Show more" [ref=e178]:
                - link "Show more" [ref=e179] [cursor=pointer]:
                  - link "Show more" [ref=e180]:
                    - generic [ref=e183]:
                      - img
                    - generic [ref=e184]: Show more
          - generic [ref=e185]:
            - heading "More from YouTube" [level=3] [ref=e186]:
              - generic [ref=e187]: More from YouTube
            - generic [ref=e188]:
              - link "YouTube Premium" [ref=e190] [cursor=pointer]:
                - /url: /premium
                - link "YouTube Premium" [ref=e191]:
                  - generic [ref=e194]:
                    - img
                  - generic [ref=e195]: YouTube Premium
              - link "YouTube Music" [ref=e197] [cursor=pointer]:
                - /url: https://music.youtube.com/
                - link "YouTube Music" [ref=e198]:
                  - generic [ref=e201]:
                    - img
                  - generic [ref=e202]: YouTube Music
              - link "YouTube Kids" [ref=e204] [cursor=pointer]:
                - /url: https://www.youtubekids.com/?source=youtube_web
                - link "YouTube Kids" [ref=e205]:
                  - generic [ref=e208]:
                    - img
                  - generic [ref=e209]: YouTube Kids
          - link "Report history" [ref=e213] [cursor=pointer]:
            - /url: /reporthistory
            - link "Report history" [ref=e214]:
              - generic [ref=e217]:
                - img
              - generic [ref=e218]: Report history
        - generic [ref=e219]:
          - generic [ref=e220]:
            - link "About" [ref=e221] [cursor=pointer]:
              - /url: https://www.youtube.com/about/
            - link "Press" [ref=e222] [cursor=pointer]:
              - /url: https://www.youtube.com/about/press/
            - link "Copyright" [ref=e223] [cursor=pointer]:
              - /url: https://www.youtube.com/about/copyright/
            - link "Contact us" [ref=e224] [cursor=pointer]:
              - /url: /t/contact_us/
            - link "Creators" [ref=e225] [cursor=pointer]:
              - /url: https://www.youtube.com/creators/
            - link "Advertise" [ref=e226] [cursor=pointer]:
              - /url: https://www.youtube.com/ads/
            - link "Developers" [ref=e227] [cursor=pointer]:
              - /url: https://developers.google.com/youtube
          - generic [ref=e228]:
            - link "Terms" [ref=e229] [cursor=pointer]:
              - /url: /t/terms
            - link "Privacy" [ref=e230] [cursor=pointer]:
              - /url: /t/privacy
            - link "Policy & Safety" [ref=e231] [cursor=pointer]:
              - /url: https://www.youtube.com/about/policies/
            - link "How YouTube works" [ref=e232] [cursor=pointer]:
              - /url: https://www.youtube.com/howyoutubeworks?utm_campaign=ytgen&utm_source=ythp&utm_medium=LeftNav&utm_content=txt&u=https%3A%2F%2Fwww.youtube.com%2Fhowyoutubeworks%3Futm_source%3Dythp%26utm_medium%3DLeftNav%26utm_campaign%3Dytgen
            - link "Test new features" [ref=e233] [cursor=pointer]:
              - /url: /new
          - generic [ref=e234]: © 2026 Google LLC
  - navigation [ref=e235]:
    - generic [ref=e236]:
      - link "Home" [ref=e238] [cursor=pointer]:
        - /url: /
        - generic [ref=e241]:
          - img
        - generic [ref=e242]: Home
      - link "Shorts" [ref=e244] [cursor=pointer]:
        - /url: /shorts/
        - generic [ref=e247]:
          - img
        - generic [ref=e248]: Shorts
      - link "Subscriptions" [ref=e250] [cursor=pointer]:
        - /url: /feed/subscriptions
        - generic [ref=e253]:
          - img
        - generic [ref=e254]: Subscriptions
      - link "You" [ref=e256] [cursor=pointer]:
        - /url: /feed/you
        - generic [ref=e259]:
          - img
        - generic [ref=e260]: You
  - generic [ref=e261]:
    - main [ref=e262]:
      - generic [ref=e263]:
        - generic [ref=e265]:
          - tablist [ref=e270]:
            - tab "All" [selected] [ref=e274] [cursor=pointer]:
              - generic [ref=e276]: All
            - tab "Unwatched" [ref=e283] [cursor=pointer]:
              - generic [ref=e285]: Unwatched
            - tab "Watched" [ref=e292] [cursor=pointer]:
              - generic [ref=e294]: Watched
            - tab "Videos" [ref=e301] [cursor=pointer]:
              - generic [ref=e303]: Videos
            - tab "Recently uploaded" [ref=e310] [cursor=pointer]:
              - generic [ref=e312]: Recently uploaded
            - tab "Live" [ref=e319] [cursor=pointer]:
              - generic [ref=e321]: Live
          - generic [ref=e326]:
            - button "Search filters" [ref=e328] [cursor=pointer]:
              - generic [ref=e329]: Filters
              - generic [ref=e333]:
                - img
            - tooltip "tooltip"
        - generic [ref=e342]:
          - generic [ref=e344]:
            - link [ref=e346] [cursor=pointer]:
              - /url: /watch?v=yyUHQIec83I&pp=ygUPZ29sYW5nIHR1dG9yaWFs
              - img [ref=e348]
              - img [ref=e351]:
                - generic [ref=e352]: 3:24:59
              - generic:
                - generic: Now playing
                - generic:
                  - img
            - generic [ref=e353] [cursor=pointer]:
              - generic [ref=e354]:
                - generic [ref=e355]:
                  - heading "Golang Tutorial for Beginners | Full Go Course 3 hours, 24 minutes" [level=3] [ref=e356]:
                    - link "Golang Tutorial for Beginners | Full Go Course 3 hours, 24 minutes" [ref=e357]:
                      - /url: /watch?v=yyUHQIec83I&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Golang Tutorial for Beginners | Full Go Course
                  - button "Action menu" [ref=e361]:
                    - generic [ref=e364]:
                      - img
                - generic [ref=e367]:
                  - generic [ref=e368]: 2.3M views
                  - generic [ref=e369]: •4 years ago
              - generic [ref=e370]:
                - link "Go to channel TechWorld with Nana" [ref=e371]:
                  - /url: /@TechWorldwithNana
                - link "TechWorld with Nana" [ref=e377]:
                  - /url: /@TechWorldwithNana
              - generic [ref=e378]:
                - generic [ref=e379]: Full Golang Tutorial to learn the Go Programming Language while building a simple CLI application In this full Golang course you ...
                - tooltip "tooltip"
              - generic [ref=e382]:
                - generic [ref=e383]:
                  - generic [ref=e387]: 23 chapters
                  - button "Intro & Course Overview | What is Go? Why Go? How it's different? | Characteristics of Go and Go Use Cases | Local Setup - Install Go & Editor | Write our First Program & Structure of a Go File | Variables & Constants in Go | Formatted Output - printf | Data Types in Go | Getting User Input | What is a Pointer? | Book Ticket Logic | Arrays & Slices | Loops in Go | Conditionals (if / else) and Boolean Data Type | Validate User Input | Switch Statement | Encapsulate Logic with Functions | Organize Code with Go Packages | Scope Rules in Go | Maps | Structs | Goroutines - Concurrency in Go | Congratulations!" [ref=e388]
                - button "More" [ref=e393]:
                  - generic [ref=e397]:
                    - img
          - generic [ref=e402]:
            - link [ref=e404] [cursor=pointer]:
              - /url: /watch?v=446E-r0rXHI&pp=ygUPZ29sYW5nIHR1dG9yaWFs
              - img [ref=e406]
              - img [ref=e409]:
                - generic [ref=e410]: 2:30
              - generic:
                - generic: Now playing
                - generic:
                  - img
            - generic [ref=e411] [cursor=pointer]:
              - generic [ref=e412]:
                - generic [ref=e413]:
                  - heading "Go in 100 Seconds 2 minutes, 30 seconds" [level=3] [ref=e414]:
                    - link "Go in 100 Seconds 2 minutes, 30 seconds" [ref=e415]:
                      - /url: /watch?v=446E-r0rXHI&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Go in 100 Seconds
                  - button "Action menu" [ref=e419]:
                    - generic [ref=e422]:
                      - img
                - generic [ref=e425]:
                  - generic [ref=e426]: 2.2M views
                  - generic [ref=e427]: •4 years ago
              - generic [ref=e428]:
                - link "Go to channel Fireship" [ref=e429]:
                  - /url: /@Fireship
                - generic [ref=e431]:
                  - link "Fireship" [ref=e435]:
                    - /url: /@Fireship
                  - img "Verified" [ref=e440]:
                    - generic [ref=e443]:
                      - img
              - generic [ref=e444]:
                - generic [ref=e445]: Learn the basics of the Go Programming Language. Go (not Golang) was developed at Google as a modern version of C for ...
                - tooltip "tooltip"
              - img "4K" [ref=e450]:
                - generic [ref=e451]: 4K
          - generic [ref=e453]:
            - link [ref=e455] [cursor=pointer]:
              - /url: /watch?v=un6ZyFkqFKo&pp=ygUPZ29sYW5nIHR1dG9yaWFs
              - img [ref=e457]
              - img [ref=e460]:
                - generic [ref=e461]: 9:32:48
              - generic:
                - generic: Now playing
                - generic:
                  - img
            - generic [ref=e462] [cursor=pointer]:
              - generic [ref=e463]:
                - generic [ref=e464]:
                  - heading "Go Programming – Golang Course with Bonus Projects 9 hours, 32 minutes" [level=3] [ref=e465]:
                    - link "Go Programming – Golang Course with Bonus Projects 9 hours, 32 minutes" [ref=e466]:
                      - /url: /watch?v=un6ZyFkqFKo&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Go Programming – Golang Course with Bonus Projects
                  - button "Action menu" [ref=e470]:
                    - generic [ref=e473]:
                      - img
                - generic [ref=e476]:
                  - generic [ref=e477]: 1.3M views
                  - generic [ref=e478]: •2 years ago
              - generic [ref=e479]:
                - link "Go to channel freeCodeCamp.org" [ref=e480]:
                  - /url: /@freecodecamp
                - generic [ref=e482]:
                  - link "freeCodeCamp.org" [ref=e486]:
                    - /url: /@freecodecamp
                  - img "Verified" [ref=e491]:
                    - generic [ref=e494]:
                      - img
              - generic [ref=e495]:
                - text: Learn the Go programming language in this full course for beginners. You'll practice writing performant, idiomatic Go with these ...
                - tooltip "tooltip"
              - img "4K" [ref=e500]:
                - generic [ref=e501]: 4K
              - generic [ref=e504]:
                - generic [ref=e505]:
                  - generic [ref=e509]: 24 chapters
                  - button "Intro | Ch 1. Why write Go? | Ch 2. Variables | Ch 3. Functions | Ch 4. Structs | Ch 5. Interfaces | Ch 6. Errors | Ch 7. Loops | Ch 8. Slices | Ch 9. Maps | Ch 10. Advanced functions | Ch 11. Pointers | Ch 12. Local development | Ch 13. Channels & concurrency | Ch 14. Mutexes | Ch 15. Generics | Ch 16. Quiz | P1. RSS aggregator project | P2. Chi router | P3. Postgres database | P4. Authentication w/ API keys | P5. Many to many relationships | P6. Aggregation worker | P7. Viewing blog posts" [ref=e510]
                - button "More" [ref=e515]:
                  - generic [ref=e519]:
                    - img
          - generic [ref=e524]:
            - link [ref=e526] [cursor=pointer]:
              - /url: /watch?v=V-lI7AmusGs&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e528] [cursor=pointer]:
              - generic [ref=e529]:
                - generic [ref=e530]:
                  - heading "Go Programming - Full Course 4 hours, 41 minutes" [level=3] [ref=e531]:
                    - link "Go Programming - Full Course 4 hours, 41 minutes" [ref=e532]:
                      - /url: /watch?v=V-lI7AmusGs&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Go Programming - Full Course
                  - button "Action menu" [ref=e536]:
                    - generic [ref=e539]:
                      - img
                - generic [ref=e542]:
                  - generic [ref=e543]: 50K views
                  - generic [ref=e544]: •2 months ago
              - generic [ref=e545]:
                - link "Go to channel Tech With Tim" [ref=e546]:
                  - /url: /@TechWithTim
                - generic [ref=e548]:
                  - link "Tech With Tim" [ref=e552]:
                    - /url: /@TechWithTim
                  - img "Verified" [ref=e557]:
                    - generic [ref=e560]:
                      - img
              - generic [ref=e561]:
                - text: Welcome to this Go Programing Course. In this course you will learn all about the Go Programing language, starting at the basic ...
                - tooltip "tooltip"
              - generic [ref=e563]:
                - img "4K" [ref=e566]:
                  - generic [ref=e567]: 4K
                - img "Closed captions" [ref=e570]:
                  - generic [ref=e571]: CC
              - generic [ref=e574]:
                - generic [ref=e575]:
                  - generic [ref=e579]: Matching chapter
                  - button "0:00 Golang Course Intro" [ref=e580]
                - button "More" [ref=e585]:
                  - generic [ref=e589]:
                    - img
          - generic [ref=e594]:
            - link [ref=e596] [cursor=pointer]:
              - /url: /watch?v=8uiZC0l4Ajw&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e598] [cursor=pointer]:
              - generic [ref=e599]:
                - generic [ref=e600]:
                  - 'heading "Learn GO Fast: Full Tutorial 1 hour, 7 minutes" [level=3] [ref=e601]':
                    - 'link "Learn GO Fast: Full Tutorial 1 hour, 7 minutes" [ref=e602]':
                      - /url: /watch?v=8uiZC0l4Ajw&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: "Learn GO Fast: Full Tutorial"
                  - button "Action menu" [ref=e606]:
                    - generic [ref=e609]:
                      - img
                - generic [ref=e612]:
                  - generic [ref=e613]: 999K views
                  - generic [ref=e614]: •2 years ago
              - generic [ref=e615]:
                - link "Go to channel Alex Mux" [ref=e616]:
                  - /url: /@mr_mux408
                - link "Alex Mux" [ref=e621]:
                  - /url: /@mr_mux408
              - generic [ref=e622]:
                - generic [ref=e623]: This is a full tutorial on learning Golang! From start to finish in less than an hour, including a full demo of how to build an api in Go.
                - tooltip "tooltip"
              - generic [ref=e626]:
                - generic [ref=e627]:
                  - generic [ref=e631]: Matching chapter
                  - button "0:00 Introduction to Golang" [ref=e632]
                - button "More" [ref=e637]:
                  - generic [ref=e641]:
                    - img
          - generic [ref=e646] [cursor=pointer]:
            - link [ref=e647]:
              - /url: /watch?v=etSN4X_fCnM&list=PL4cUxeGkcC9gC88BEo9czgyS72A3doDeM
              - generic [ref=e657]:
                - generic [ref=e660]:
                  - img
                - generic [ref=e661]: 22 lessons
            - generic [ref=e664]:
              - heading "Go Tutorial (Golang) for Beginners" [level=3] [ref=e665]:
                - link "Go Tutorial (Golang) for Beginners" [ref=e666]:
                  - /url: /watch?v=etSN4X_fCnM&list=PL4cUxeGkcC9gC88BEo9czgyS72A3doDeM
              - generic [ref=e668]:
                - generic [ref=e669]:
                  - link "Net Ninja" [ref=e672]:
                    - /url: /@NetNinja
                    - text: Net Ninja
                    - img [ref=e675]:
                      - generic [ref=e677]:
                        - img
                  - generic [ref=e678]: •
                  - link "Course" [ref=e681]:
                    - /url: /@NetNinja
                - 'link "Go (Golang) Tutorial #1 - Introduction & Setup · 6:15" [ref=e685]':
                  - /url: /watch?v=etSN4X_fCnM&list=PL4cUxeGkcC9gC88BEo9czgyS72A3doDeM
                - 'link "Go (Golang) Tutorial #2 - Your First Go File · 4:40" [ref=e688]':
                  - /url: /watch?v=RI9ngRqn9N4&list=PL4cUxeGkcC9gC88BEo9czgyS72A3doDeM
                - link "View full course" [ref=e693]:
                  - /url: /playlist?list=PL4cUxeGkcC9gC88BEo9czgyS72A3doDeM
          - generic [ref=e695]:
            - link [ref=e697] [cursor=pointer]:
              - /url: /watch?v=AGiayASyp2Q&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e699] [cursor=pointer]:
              - generic [ref=e700]:
                - generic [ref=e701]:
                  - 'heading "Curso de GOLANG (GO) Desde Cero: Primeros Pasos en una hora 1 hour, 11 minutes" [level=3] [ref=e702]':
                    - 'link "Curso de GOLANG (GO) Desde Cero: Primeros Pasos en una hora 1 hour, 11 minutes" [ref=e703]':
                      - /url: /watch?v=AGiayASyp2Q&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: "Curso de GOLANG (GO) Desde Cero: Primeros Pasos en una hora"
                  - button "Action menu" [ref=e707]:
                    - generic [ref=e710]:
                      - img
                - generic [ref=e713]:
                  - generic [ref=e714]: 98K views
                  - generic [ref=e715]: •2 years ago
              - generic [ref=e716]:
                - link "Go to channel MoureDev by Brais Moure" [ref=e717]:
                  - /url: /@mouredev
                - generic [ref=e718]:
                  - link "MoureDev by Brais Moure" [ref=e722]:
                    - /url: /@mouredev
                  - img "Verified" [ref=e727]:
                    - generic [ref=e730]:
                      - img
              - generic [ref=e731]:
                - text: "Mi nuevo campus de programación: https://mouredev.pro Cursos, ejercicios, test, certificados, soporte, comunidad y mucho más."
                - tooltip "tooltip"
              - generic [ref=e734]:
                - generic [ref=e735]:
                  - generic [ref=e739]: Matching chapter
                  - button "0:00 Golang" [ref=e740]
                - button "More" [ref=e745]:
                  - generic [ref=e749]:
                    - img
          - generic [ref=e754]:
            - heading "People also watched" [level=2] [ref=e757]:
              - generic [ref=e759]: People also watched
            - generic [ref=e761]:
              - generic [ref=e762]:
                - generic [ref=e764]:
                  - link [ref=e766] [cursor=pointer]:
                    - /url: /watch?v=H1D1EZ0gUKc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                  - generic [ref=e768] [cursor=pointer]:
                    - generic [ref=e769]:
                      - generic [ref=e770]:
                        - 'heading "Goodbye Next.js: Why Big Companies Are Leaving It (and What They''re Using Now) 27 minutes" [level=3] [ref=e771]':
                          - 'link "Goodbye Next.js: Why Big Companies Are Leaving It (and What They''re Using Now) 27 minutes" [ref=e772]':
                            - /url: /watch?v=H1D1EZ0gUKc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                            - text: "Goodbye Next.js: Why Big Companies Are Leaving It (and What They're Using Now)"
                        - button "Action menu" [ref=e776]:
                          - generic [ref=e779]:
                            - img
                      - generic [ref=e782]:
                        - generic [ref=e783]: 6.5K views
                        - generic [ref=e784]: •11 hours ago
                    - generic [ref=e785]:
                      - link "Go to channel Fazt Code" [ref=e786]:
                        - /url: /@FaztCode
                      - generic [ref=e787]:
                        - link "Fazt Code" [ref=e791]:
                          - /url: /@FaztCode
                        - img "Verified" [ref=e796]:
                          - generic [ref=e799]:
                            - img
                    - generic [ref=e800]:
                      - text: "🔥 Easily deploy your projects 👉 https://seenode.com Is Next.js dying in 2026? 🔥 Big companies are abandoning it: Railway ..."
                      - tooltip "tooltip"
                    - img "New" [ref=e805]:
                      - generic [ref=e806]: New
                - generic [ref=e808]:
                  - link [ref=e810] [cursor=pointer]:
                    - /url: /watch?v=G58gN0lIbyI&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                  - generic [ref=e812] [cursor=pointer]:
                    - generic [ref=e813]:
                      - generic [ref=e814]:
                        - heading "CÓMO hacer un CRUD ► 🎁 crud GOlang MySql PASO a PASO 1 hour, 30 minutes" [level=3] [ref=e815]:
                          - link "CÓMO hacer un CRUD ► 🎁 crud GOlang MySql PASO a PASO 1 hour, 30 minutes" [ref=e816]:
                            - /url: /watch?v=G58gN0lIbyI&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                            - text: CÓMO hacer un CRUD ► 🎁 crud GOlang MySql PASO a PASO
                        - button "Action menu" [ref=e820]:
                          - generic [ref=e823]:
                            - img
                      - generic [ref=e826]:
                        - generic [ref=e827]: 46K views
                        - generic [ref=e828]: •5 years ago
                    - generic [ref=e829]:
                      - link "Go to channel Develoteca - Oscar Uh" [ref=e830]:
                        - /url: /@Develoteca
                      - generic [ref=e831]:
                        - link "Develoteca - Oscar Uh" [ref=e835]:
                          - /url: /@Develoteca
                        - img "Verified" [ref=e840]:
                          - generic [ref=e843]:
                            - img
                    - generic [ref=e844]:
                      - text: "Más cursos en: https://cursos.develoteca.com/ Únete a este canal para acceder a sus beneficios: ..."
                      - tooltip "tooltip"
                    - generic [ref=e847]:
                      - generic [ref=e848]:
                        - generic [ref=e852]: 22 chapters
                        - button "(=) INTRODUCCIÓN | (=) PAUTAS | (1) Materiales | (2) Hola Develoteca | (3) Templates | (4) Cabecera y pie de página | (5) Formulario de agregar empleado | (6)Creando la base de datos | (7)Driver MySQL | (8)Conexión a base de datos | (9)Insertar datos desde formulario | (10)Consultando registros de BD | (11)Mostrando registros en template | (12)Recepción de dato por GET | (13)Borrar Registros | (==) FALTA POCO | (14)Recuperando datos para editar | (15)Mostrar datos para actualizar empleados | (16)Actualizar registros de empleados | (17)Ajustes finales de interfaz | (==)DESPEDIDA | (==)AGRADECIMIENTO A MIEMBROS Y MÚSICA" [ref=e853]
                      - button "More" [ref=e858]:
                        - generic [ref=e862]:
                          - img
                - generic [ref=e867]:
                  - link [ref=e869] [cursor=pointer]:
                    - /url: /watch?v=Du3RTGZV_ek&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                  - generic [ref=e871] [cursor=pointer]:
                    - generic [ref=e872]:
                      - generic [ref=e873]:
                        - heading "Introduction to Go (2023) 53 minutes" [level=3] [ref=e874]:
                          - link "Introduction to Go (2023) 53 minutes" [ref=e875]:
                            - /url: /watch?v=Du3RTGZV_ek&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                            - text: Introduction to Go (2023)
                        - button "Action menu" [ref=e879]:
                          - generic [ref=e882]:
                            - img
                      - generic [ref=e885]:
                        - generic [ref=e886]: 2.4K views
                        - generic [ref=e887]: •2 years ago
                    - generic [ref=e888]:
                      - link "Go to channel The Gopher Engineer" [ref=e889]:
                        - /url: /@TheGopherEngineer
                      - link "The Gopher Engineer" [ref=e894]:
                        - /url: /@TheGopherEngineer
                    - generic [ref=e895]:
                      - text: A comprehensive guide from scratch to the Golang programming language.
                      - tooltip "tooltip"
                - generic [ref=e897]:
                  - link [ref=e899] [cursor=pointer]:
                    - /url: /watch?v=8XRTAPWMO2E&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                  - generic [ref=e901] [cursor=pointer]:
                    - generic [ref=e902]:
                      - generic [ref=e903]:
                        - heading "Go Full-Stack Pizza Tracker Admin Dashboard | Real-Time Updates (Gin, GORM, SSE, Golang) 4 hours, 28 minutes" [level=3] [ref=e904]:
                          - link "Go Full-Stack Pizza Tracker Admin Dashboard | Real-Time Updates (Gin, GORM, SSE, Golang) 4 hours, 28 minutes" [ref=e905]:
                            - /url: /watch?v=8XRTAPWMO2E&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                            - text: Go Full-Stack Pizza Tracker Admin Dashboard | Real-Time Updates (Gin, GORM, SSE, Golang)
                        - button "Action menu" [ref=e909]:
                          - generic [ref=e912]:
                            - img
                      - generic [ref=e915]:
                        - generic [ref=e916]: 17K views
                        - generic [ref=e917]: •4 months ago
                    - generic [ref=e918]:
                      - link "Go to channel Coding with Patrik" [ref=e919]:
                        - /url: /@codingwithpatrik
                      - link "Coding with Patrik" [ref=e924]:
                        - /url: /@codingwithpatrik
                    - generic [ref=e925]:
                      - generic [ref=e926]: Learn how to build a real-time pizza order tracker with Go Golang, Gin, Gorm, and more. This step-by-step tutorial covers ...
                      - tooltip "tooltip"
                    - generic [ref=e929]:
                      - generic [ref=e930]:
                        - generic [ref=e934]: 12 chapters
                        - button "Introduction & project overview (Go, Gin, Gorm) | Setup Project | Order GORM models | Custom validators | Order handlers | Creating utils file | Base & order templates | Testing creating an order | Order tracking Page | Admin login | Admin Dashboard | Real-time order updates SSE (channels, goroutines, mutex)– Outro" [ref=e935]
                      - button "More" [ref=e940]:
                        - generic [ref=e944]:
                          - img
              - generic "+6 more" [ref=e949] [cursor=pointer]
          - generic [ref=e951] [cursor=pointer]:
            - link [ref=e952]:
              - /url: /watch?v=75lJDVT1h0s&list=PLzMcBGfZo4-mtY_SE3HuzQJzuj4VlUG0q
              - generic [ref=e962]:
                - generic [ref=e965]:
                  - img
                - generic [ref=e966]: 22 lessons
            - generic [ref=e969]:
              - heading "Golang Tutorials" [level=3] [ref=e970]:
                - link "Golang Tutorials" [ref=e971]:
                  - /url: /watch?v=75lJDVT1h0s&list=PLzMcBGfZo4-mtY_SE3HuzQJzuj4VlUG0q
              - generic [ref=e973]:
                - generic [ref=e974]:
                  - link "Tech With Tim" [ref=e977]:
                    - /url: /@TechWithTim
                    - text: Tech With Tim
                    - img [ref=e980]:
                      - generic [ref=e982]:
                        - img
                  - generic [ref=e983]: •
                  - link "Course" [ref=e986]:
                    - /url: /@TechWithTim
                - 'link "Golang Tutorial #1 - An Introduction to Go Programming · 16:08" [ref=e990]':
                  - /url: /watch?v=75lJDVT1h0s&list=PLzMcBGfZo4-mtY_SE3HuzQJzuj4VlUG0q
                - 'link "Golang Tutorial #2 - Variables & Data Types · 14:47" [ref=e993]':
                  - /url: /watch?v=pM0-CMysa_M&list=PLzMcBGfZo4-mtY_SE3HuzQJzuj4VlUG0q
                - link "View full course" [ref=e998]:
                  - /url: /playlist?list=PLzMcBGfZo4-mtY_SE3HuzQJzuj4VlUG0q
          - generic [ref=e1000]:
            - link [ref=e1002] [cursor=pointer]:
              - /url: /watch?v=z-NtGea-378&t=6s&pp=ygUPZ29sYW5nIHR1dG9yaWFs0gcJCdMKAYcqIYzv
            - generic [ref=e1004] [cursor=pointer]:
              - generic [ref=e1005]:
                - generic [ref=e1006]:
                  - heading "Curso INTENSIVO de GO ! - te enseño TODO lo que tienes que saber 1 hour, 39 minutes" [level=3] [ref=e1007]:
                    - link "Curso INTENSIVO de GO ! - te enseño TODO lo que tienes que saber 1 hour, 39 minutes" [ref=e1008]:
                      - /url: /watch?v=z-NtGea-378&t=6s&pp=ygUPZ29sYW5nIHR1dG9yaWFs0gcJCdMKAYcqIYzv
                      - text: Curso INTENSIVO de GO ! - te enseño TODO lo que tienes que saber
                  - button "Action menu" [ref=e1012]:
                    - generic [ref=e1015]:
                      - img
                - generic [ref=e1018]:
                  - generic [ref=e1019]: 28K views
                  - generic [ref=e1020]: •11 months ago
              - generic [ref=e1021]:
                - link "Go to channel Gentleman Programming" [ref=e1022]:
                  - /url: /@gentlemanprogramming
                - link "Gentleman Programming" [ref=e1027]:
                  - /url: /@gentlemanprogramming
              - generic [ref=e1028]:
                - generic [ref=e1029]: GO PROGRAMMING CURSO COMPLETO - DE CERO A EXPERTO EN 1.5 HORAS → Aprende Golang desde fundamentos ...
                - tooltip "tooltip"
              - img "4K" [ref=e1034]:
                - generic [ref=e1035]: 4K
              - generic [ref=e1038]:
                - generic [ref=e1039]:
                  - generic [ref=e1043]: Matching chapter
                  - button "0:06 ¿Qué es Go? - Por qué elegir Golang en 2025" [ref=e1044]
                - button "More" [ref=e1049]:
                  - generic [ref=e1053]:
                    - img
          - generic [ref=e1058]:
            - link [ref=e1060] [cursor=pointer]:
              - /url: /watch?v=XCZWyN9ZbEQ&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1062] [cursor=pointer]:
              - generic [ref=e1063]:
                - generic [ref=e1064]:
                  - heading "Full Golang Tutorial - Learn Go by Building a TodoList App 1 hour, 34 minutes" [level=3] [ref=e1065]:
                    - link "Full Golang Tutorial - Learn Go by Building a TodoList App 1 hour, 34 minutes" [ref=e1066]:
                      - /url: /watch?v=XCZWyN9ZbEQ&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Full Golang Tutorial - Learn Go by Building a TodoList App
                  - button "Action menu" [ref=e1070]:
                    - generic [ref=e1073]:
                      - img
                - generic [ref=e1076]:
                  - generic [ref=e1077]: 212K views
                  - generic [ref=e1078]: •1 year ago
              - generic [ref=e1079]:
                - link "Go to channel TechWorld with Nana" [ref=e1080]:
                  - /url: /@TechWorldwithNana
                - link "TechWorld with Nana" [ref=e1085]:
                  - /url: /@TechWorldwithNana
              - generic [ref=e1086]:
                - text: A Complete Go Crash Course for Beginners to learn the core Go concepts by writing a simple TodoList Application ...
                - tooltip "tooltip"
              - generic [ref=e1089]:
                - generic [ref=e1090]:
                  - generic [ref=e1094]: 14 chapters
                  - button "Intro & Course Overview | Introduction to Go - Why Go? | Characteristics of Go and Go Use Cases | Local Setup - Download Go & GoLand IDE | Write our First Program & Structure of a Go File | Execute Go Program | Start writing our ToDoList Application | Data Types in Go | Variables in Go | Arrays & Slices in Go | Loops in Go | Functions in Go | Variable Scopes in Go | Build HTTP endpoints and Start Web Server to serve requests" [ref=e1095]
                - button "More" [ref=e1100]:
                  - generic [ref=e1104]:
                    - img
          - generic [ref=e1109]:
            - link [ref=e1111] [cursor=pointer]:
              - /url: /watch?v=YzLrWHZa-Kc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1113] [cursor=pointer]:
              - generic [ref=e1114]:
                - generic [ref=e1115]:
                  - 'heading "Golang Tutorial : Go Full Course 3 hours, 49 minutes" [level=3] [ref=e1116]':
                    - 'link "Golang Tutorial : Go Full Course 3 hours, 49 minutes" [ref=e1117]':
                      - /url: /watch?v=YzLrWHZa-Kc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: "Golang Tutorial : Go Full Course"
                  - button "Action menu" [ref=e1121]:
                    - generic [ref=e1124]:
                      - img
                - generic [ref=e1127]:
                  - generic [ref=e1128]: 294K views
                  - generic [ref=e1129]: •3 years ago
              - generic [ref=e1130]:
                - link "Go to channel Derek Banas" [ref=e1131]:
                  - /url: /@derekbanas
                - generic [ref=e1132]:
                  - link "Derek Banas" [ref=e1136]:
                    - /url: /@derekbanas
                  - img "Verified" [ref=e1141]:
                    - generic [ref=e1144]:
                      - img
              - generic [ref=e1145]:
                - text: "I wrote a Techno-Thriller called Whispers if you're interested: https://amzn.to/4cfdtNW I'd greatly appreciate a review for it if you ..."
                - tooltip "tooltip"
              - generic [ref=e1148]:
                - generic [ref=e1149]:
                  - generic [ref=e1153]: 57 chapters
                  - button "Intro | Package | Import | Alias | Comments | Main | User Input | Error Handling | Blank Identifier | Variables | Data Types | Casting | Casting Strings | If Conditional | Strings | Runes | Printf | Time | Math | For Loop | While Loop | Range | Arrays | Slices | Functions | Return Multiple | Function Errors | Varadic Functions | Passing Arrays | Pointers | Pass Array Pointers | File IO | Command Line | Packages / Modules | Maps | Generics | Constraints | Structs | Composition | Defined types | Associate Methods | Protecting Data | Getter / Setter | Encapsulation | Interfaces | Concurrency / GoRoutines | Sleep | Channels | Mutex / Lock | Closures | Passing Functions | Recursion | Regular Expressions | Automated Testing | Web app | Templates / HTML | Installation" [ref=e1154]
                - button "More" [ref=e1159]:
                  - generic [ref=e1163]:
                    - img
          - generic [ref=e1168]:
            - link [ref=e1170] [cursor=pointer]:
              - /url: /watch?v=ID9NZ88JeOE&t=162s&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1172] [cursor=pointer]:
              - generic [ref=e1173]:
                - generic [ref=e1174]:
                  - 'heading "Curso Go (Golang) Desde Cero a API CRUD: Curso Completo Paso a Paso 3 hours, 31 minutes" [level=3] [ref=e1175]':
                    - 'link "Curso Go (Golang) Desde Cero a API CRUD: Curso Completo Paso a Paso 3 hours, 31 minutes" [ref=e1176]':
                      - /url: /watch?v=ID9NZ88JeOE&t=162s&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: "Curso Go (Golang) Desde Cero a API CRUD: Curso Completo Paso a Paso"
                  - button "Action menu" [ref=e1180]:
                    - generic [ref=e1183]:
                      - img
                - generic [ref=e1186]:
                  - generic [ref=e1187]: 17K views
                  - generic [ref=e1188]: •8 months ago
              - generic [ref=e1189]:
                - link "Go to channel Cesar Jimenez" [ref=e1190]:
                  - /url: /@CesarJimenez-en-Espanol
                - link "Cesar Jimenez" [ref=e1195]:
                  - /url: /@CesarJimenez-en-Espanol
              - generic [ref=e1196]:
                - generic [ref=e1197]: "Curso Go (Golang) Desde Cero a API CRUD: Curso Completo Paso a Paso Apóyame con un café ..."
                - tooltip "tooltip"
              - img "4K" [ref=e1202]:
                - generic [ref=e1203]: 4K
              - generic [ref=e1206]:
                - generic [ref=e1207]:
                  - generic [ref=e1211]: Matching chapter
                  - button "2:42 Instalar Golang" [ref=e1212]
                - button "More" [ref=e1217]:
                  - generic [ref=e1221]:
                    - img
          - generic [ref=e1226]:
            - link [ref=e1228] [cursor=pointer]:
              - /url: /watch?v=yXMjeRXglGc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1230] [cursor=pointer]:
              - generic [ref=e1231]:
                - generic [ref=e1232]:
                  - heading "HARD truths before switching to Go 24 minutes" [level=3] [ref=e1233]:
                    - link "HARD truths before switching to Go 24 minutes" [ref=e1234]:
                      - /url: /watch?v=yXMjeRXglGc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: HARD truths before switching to Go
                  - button "Action menu" [ref=e1238]:
                    - generic [ref=e1241]:
                      - img
                - generic [ref=e1244]:
                  - generic [ref=e1245]: 508K views
                  - generic [ref=e1246]: •10 months ago
              - generic [ref=e1247]:
                - link "Go to channel The PrimeTime" [ref=e1248]:
                  - /url: /@ThePrimeTimeagen
                - generic [ref=e1249]:
                  - link "The PrimeTime" [ref=e1253]:
                    - /url: /@ThePrimeTimeagen
                  - img "Verified" [ref=e1258]:
                    - generic [ref=e1261]:
                      - img
              - generic [ref=e1262]:
                - text: "Twitch https://twitch.tv/ThePrimeagen Discord https://discord.gg/ThePrimeagen Become Backend Dev: https://boot.dev/prime (plus ..."
                - tooltip "tooltip"
              - img "4K" [ref=e1267]:
                - generic [ref=e1268]: 4K
              - generic [ref=e1271]:
                - generic [ref=e1272]:
                  - generic [ref=e1273]:
                    - generic [ref=e1276]:
                      - img
                    - generic [ref=e1277]: Summary
                  - button "This video offers a nuanced perspective on Go, exploring both its lauded features and less-discussed drawbacks. The creator examines several key aspects, including error handling and inheritance, providing examples and code snippets. A seasoned developer shares personal experiences, offering valuable insights for those considering a switch to Go." [ref=e1278]
                  - text: ·
                - button "More" [ref=e1283]:
                  - generic [ref=e1287]:
                    - img
          - generic [ref=e1292]:
            - link [ref=e1294] [cursor=pointer]:
              - /url: /watch?v=YS4e4q9oBaU&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1296] [cursor=pointer]:
              - generic [ref=e1297]:
                - generic [ref=e1298]:
                  - heading "Learn Go Programming - Golang Tutorial for Beginners 6 hours, 39 minutes" [level=3] [ref=e1299]:
                    - link "Learn Go Programming - Golang Tutorial for Beginners 6 hours, 39 minutes" [ref=e1300]:
                      - /url: /watch?v=YS4e4q9oBaU&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Learn Go Programming - Golang Tutorial for Beginners
                  - button "Action menu" [ref=e1304]:
                    - generic [ref=e1307]:
                      - img
                - generic [ref=e1310]:
                  - generic [ref=e1311]: 2.6M views
                  - generic [ref=e1312]: •6 years ago
              - generic [ref=e1313]:
                - link "Go to channel freeCodeCamp.org" [ref=e1314]:
                  - /url: /@freecodecamp
                - generic [ref=e1315]:
                  - link "freeCodeCamp.org" [ref=e1319]:
                    - /url: /@freecodecamp
                  - img "Verified" [ref=e1324]:
                    - generic [ref=e1327]:
                      - img
              - generic [ref=e1328]:
                - generic [ref=e1329]: Learn the Go programming language (Golang) in this step-by-step tutorial course for beginners. Go is an open source ...
                - tooltip "tooltip"
              - img "Closed captions" [ref=e1334]:
                - generic [ref=e1335]: CC
              - generic [ref=e1338]:
                - generic [ref=e1339]:
                  - generic [ref=e1343]: 15 chapters
                  - button "Introduction | Setting Up a Development Environment | Variables | Primitives | Constants | Arrays and Slices | Maps and Structs | If and Switch Statements | Looping | Defer, Panic, and Recover | Pointers | Functions | Interfaces | Goroutines | Channels" [ref=e1344]
                - button "More" [ref=e1349]:
                  - generic [ref=e1353]:
                    - img
          - generic [ref=e1358] [cursor=pointer]:
            - link [ref=e1359]:
              - /url: /watch?v=eSrr4YT24Y4&list=PLq3etM-zISamTauFTO5-G5dqBN07ckzTk
              - generic [ref=e1369]:
                - generic [ref=e1372]:
                  - img
                - generic [ref=e1373]: 84 lessons
            - generic [ref=e1376]:
              - heading "The Complete GoLang Course" [level=3] [ref=e1377]:
                - link "The Complete GoLang Course" [ref=e1378]:
                  - /url: /watch?v=eSrr4YT24Y4&list=PLq3etM-zISamTauFTO5-G5dqBN07ckzTk
              - generic [ref=e1380]:
                - generic [ref=e1381]:
                  - link "Code & Learn" [ref=e1384]:
                    - /url: /@codeandlearnnow
                  - generic [ref=e1385]: •
                  - link "Course" [ref=e1388]:
                    - /url: /@codeandlearnnow
                - link "Getting Started with Go | Installing and Writing Your First Program · 9:38" [ref=e1392]:
                  - /url: /watch?v=eSrr4YT24Y4&list=PLq3etM-zISamTauFTO5-G5dqBN07ckzTk
                - link "Primitive Data Types in Go | A Comprehensive Guide to Booleans, Strings, and Numbers · 9:46" [ref=e1395]:
                  - /url: /watch?v=WFbiye5eUyw&list=PLq3etM-zISamTauFTO5-G5dqBN07ckzTk
                - link "View full course" [ref=e1400]:
                  - /url: /playlist?list=PLq3etM-zISamTauFTO5-G5dqBN07ckzTk
          - generic [ref=e1402] [cursor=pointer]:
            - link [ref=e1403]:
              - /url: /watch?v=YmGp5Uzh4ag&list=PLXQpH_kZIxTWUe-Ee-DZEX5gfeoo4tHV6
              - generic [ref=e1413]:
                - generic [ref=e1416]:
                  - img
                - generic [ref=e1417]: 34 lessons
            - generic [ref=e1420]:
              - heading "Golang Tutorial" [level=3] [ref=e1421]:
                - link "Golang Tutorial" [ref=e1422]:
                  - /url: /watch?v=YmGp5Uzh4ag&list=PLXQpH_kZIxTWUe-Ee-DZEX5gfeoo4tHV6
              - generic [ref=e1424]:
                - generic [ref=e1425]:
                  - link "Coder's Gyan" [ref=e1428]:
                    - /url: /@CodersGyan
                    - text: Coder's Gyan
                    - img [ref=e1431]:
                      - generic [ref=e1433]:
                        - img
                  - generic [ref=e1434]: •
                  - link "Course" [ref=e1437]:
                    - /url: /@CodersGyan
                - link "Golang Tutorial - Introduction - 1 · 3:52" [ref=e1441]:
                  - /url: /watch?v=YmGp5Uzh4ag&list=PLXQpH_kZIxTWUe-Ee-DZEX5gfeoo4tHV6
                - link "Golang Tutorial - Five Reasons to choose Golang - 2 · 5:39" [ref=e1444]:
                  - /url: /watch?v=DgtkSRPnXgU&list=PLXQpH_kZIxTWUe-Ee-DZEX5gfeoo4tHV6
                - link "View full course" [ref=e1449]:
                  - /url: /playlist?list=PLXQpH_kZIxTWUe-Ee-DZEX5gfeoo4tHV6
          - generic [ref=e1451]:
            - link [ref=e1453] [cursor=pointer]:
              - /url: /watch?v=zu5BA54HBZc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1455] [cursor=pointer]:
              - generic [ref=e1456]:
                - generic [ref=e1457]:
                  - 'heading "¿Qué es GoLang? tutorial | ventajas y estructura recomendada de proyecto con clean architecture #go 16 minutes" [level=3] [ref=e1458]':
                    - 'link "¿Qué es GoLang? tutorial | ventajas y estructura recomendada de proyecto con clean architecture #go 16 minutes" [ref=e1459]':
                      - /url: /watch?v=zu5BA54HBZc&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: "¿Qué es GoLang? tutorial | ventajas y estructura recomendada de proyecto con clean architecture #go"
                  - button "Action menu" [ref=e1463]:
                    - generic [ref=e1466]:
                      - img
                - generic [ref=e1469]:
                  - generic [ref=e1470]: 21K views
                  - generic [ref=e1471]: •1 year ago
              - generic [ref=e1472]:
                - link "Go to channel Gentleman Programming" [ref=e1473]:
                  - /url: /@gentlemanprogramming
                - link "Gentleman Programming" [ref=e1478]:
                  - /url: /@gentlemanprogramming
              - generic [ref=e1479]:
                - text: Dale play a este video de YouTube y sumérgete en el mundo de Go! En cada capítulo te voy a mostrar por qué esta tecnología ...
                - tooltip "tooltip"
              - generic [ref=e1482]:
                - generic [ref=e1483]:
                  - generic [ref=e1487]: 10 chapters
                  - button "Introducción a Go, resaltando su importancia y velocidad. | Ventajas de Go, enfocándose en su rápida compilación y ejecución. | Escalabilidad y programación concurrente en Go. | Gestión automática de la memoria y recolector de basura en Go. | Simplificación del desarrollo en Go, con menos boilerplate necesario. | Introducción a Golan Puro y sus fundamentos. | Estructura del Código y uso de Boilerplate. | API Interna, Networking y velocidad de ejecución. | Integración con HTMX y beneficios de renderizar desde Go. | Organización del proyecto y significado de las carpetas CMD, Internal y UI" [ref=e1488]
                - button "More" [ref=e1493]:
                  - generic [ref=e1497]:
                    - img
          - generic [ref=e1502] [cursor=pointer]:
            - link [ref=e1503]:
              - /url: /watch?v=JoJ8Sw5Yb4c&list=PLRAV69dS1uWQGDQoBYMZWKjzuhCaOnBpa
              - generic [ref=e1513]:
                - generic [ref=e1516]:
                  - img
                - generic [ref=e1517]: 57 videos
            - generic [ref=e1520]:
              - heading "Let's go with golang" [level=3] [ref=e1521]:
                - link "Let's go with golang" [ref=e1522]:
                  - /url: /watch?v=JoJ8Sw5Yb4c&list=PLRAV69dS1uWQGDQoBYMZWKjzuhCaOnBpa
              - generic [ref=e1524]:
                - generic [ref=e1525]:
                  - link "Hitesh Choudhary" [ref=e1528]:
                    - /url: /@HiteshCodeLab
                    - text: Hitesh Choudhary
                    - img [ref=e1531]:
                      - generic [ref=e1533]:
                        - img
                  - generic [ref=e1534]: •
                  - link "Playlist" [ref=e1537]:
                    - /url: /@HiteshCodeLab
                - link "Welcome to series on GO programming language · 4:59" [ref=e1541]:
                  - /url: /watch?v=JoJ8Sw5Yb4c&list=PLRAV69dS1uWQGDQoBYMZWKjzuhCaOnBpa
                - link "Before you start with golang · 7:53" [ref=e1544]:
                  - /url: /watch?v=F3klnY_r8FU&list=PLRAV69dS1uWQGDQoBYMZWKjzuhCaOnBpa
                - link "View full playlist" [ref=e1549]:
                  - /url: /playlist?list=PLRAV69dS1uWQGDQoBYMZWKjzuhCaOnBpa
          - generic [ref=e1551]:
            - link [ref=e1553] [cursor=pointer]:
              - /url: /watch?v=s3XItrqfccw&pp=ygUPZ29sYW5nIHR1dG9yaWFs
            - generic [ref=e1555] [cursor=pointer]:
              - generic [ref=e1556]:
                - generic [ref=e1557]:
                  - heading "Building a Production API in Golang from Scratch (Ecommerce project) 2 hours, 2 minutes" [level=3] [ref=e1558]:
                    - link "Building a Production API in Golang from Scratch (Ecommerce project) 2 hours, 2 minutes" [ref=e1559]:
                      - /url: /watch?v=s3XItrqfccw&pp=ygUPZ29sYW5nIHR1dG9yaWFs
                      - text: Building a Production API in Golang from Scratch (Ecommerce project)
                  - button "Action menu" [ref=e1563]:
                    - generic [ref=e1566]:
                      - img
                - generic [ref=e1569]:
                  - generic [ref=e1570]: 71K views
                  - generic [ref=e1571]: •5 months ago
              - generic [ref=e1572]:
                - link "Go to channel Tiago" [ref=e1573]:
                  - /url: /@TiagoTaquelim
                - link "Tiago" [ref=e1578]:
                  - /url: /@TiagoTaquelim
              - generic [ref=e1579]:
                - text: "Join to level up as a software engineer: https://selfmadeengineer.com https://www.youtube.com/watch?v=o8FZ_rN26oo ..."
                - tooltip "tooltip"
              - generic [ref=e1582]:
                - generic [ref=e1583]:
                  - generic [ref=e1587]: 17 chapters
                  - button "Intro | Project Architecture & Design | Project Structure | HTTP Server Setup | Structured Logging | Clean Architecture | Listing Products Handler | Sending JSON | Products Service | Databases with sqlc | Migrations | Running Postgres Locally | Connecting to Postgres with Go | Challenge 1 | Placing an Order from the API | Challenge 2 | Manually testing the API" [ref=e1588]
                - button "More" [ref=e1593]:
                  - generic [ref=e1597]:
                    - img
          - generic [ref=e1602]:
            - link [ref=e1604] [cursor=pointer]:
              - /url: /watch?v=3lazW_dSXKM&t=548s&pp=ygUPZ29sYW5nIHR1dG9yaWFs0gcJCdMKAYcqIYzv
            - generic [ref=e1606] [cursor=pointer]:
              - generic [ref=e1607]:
                - generic [ref=e1608]:
                  - 'heading "Golang Made Easy: Learn the Basics in Just 10 Minutes 9 minutes, 53 seconds" [level=3] [ref=e1609]':
                    - 'link "Golang Made Easy: Learn the Basics in Just 10 Minutes 9 minutes, 53 seconds" [ref=e1610]':
                      - /url: /watch?v=3lazW_dSXKM&t=548s&pp=ygUPZ29sYW5nIHR1dG9yaWFs0gcJCdMKAYcqIYzv
                      - text: "Golang Made Easy: Learn the Basics in Just 10 Minutes"
                  - button "Action menu" [ref=e1614]:
                    - generic [ref=e1617]:
                      - img
                - generic [ref=e1620]:
                  - generic [ref=e1621]: 41K views
                  - generic [ref=e1622]: •2 years ago
              - generic [ref=e1623]:
                - link "Go to channel Gerald Yerden" [ref=e1624]:
                  - /url: /@devhulk
                - link "Gerald Yerden" [ref=e1629]:
                  - /url: /@devhulk
              - generic [ref=e1630]:
                - generic [ref=e1631]: In this quick 10-minute tutorial, you'll learn how to use Golang, a popular programming language. Golang is easy to learn and can ...
                - tooltip "tooltip"
              - generic [ref=e1634]:
                - generic [ref=e1635]:
                  - generic [ref=e1639]: 15 moments
                  - button "9:08 Golang Project" [ref=e1640]
                - button "More" [ref=e1645]:
                  - generic [ref=e1649]:
                    - img
    - text: •
```

# Test source

```ts
  181 | 
  182 |   function findUrlForItem(item: Record<string, unknown>): string | null {
  183 |     const titleText = String(item.title || item.name || item.text || '').toLowerCase().trim()
  184 |     if (!titleText) return null
  185 | 
  186 |     let bestMatch: { href: string; score: number } | null = null
  187 |     for (const link of links) {
  188 |       if (!link.text) continue
  189 |       const words = titleText.split(/\s+/).filter(w => w.length > 2)
  190 |       const overlap = words.filter(w => link.text.includes(w)).length
  191 |       if (overlap > (bestMatch?.score ?? 0)) {
  192 |         bestMatch = { href: link.href, score: overlap }
  193 |       }
  194 |     }
  195 |     return bestMatch && bestMatch.score >= 2 ? bestMatch.href : null
  196 |   }
  197 | 
  198 |   function enrichLeaf(item: Record<string, unknown>, itemSchema: Record<string, unknown>): Record<string, unknown> {
  199 |     const out = { ...item }
  200 |     for (const [key, val] of Object.entries(item)) {
  201 |       const schemaValue = itemSchema[key]
  202 |       if (isUrlField(key, schemaValue) && (!val || val === '')) {
  203 |         const matchUrl = findUrlForItem(out)
  204 |         if (matchUrl) out[key] = matchUrl
  205 |       }
  206 |     }
  207 |     return out
  208 |   }
  209 | 
  210 |   function walk(val: unknown, valSchema: Record<string, unknown>): unknown {
  211 |     if (Array.isArray(val)) return val.map(el => walk(el, valSchema))
  212 |     if (val !== null && typeof val === 'object') {
  213 |       const obj = val as Record<string, unknown>
  214 |       const hasArrayChild = Object.values(obj).some(v => Array.isArray(v))
  215 |       if (hasArrayChild) {
  216 |         const out: Record<string, unknown> = {}
  217 |         for (const [k, v] of Object.entries(obj)) {
  218 |           const childSchema = valSchema[k]
  219 |           const innerSchema = Array.isArray(childSchema) && childSchema.length > 0 && typeof childSchema[0] === 'object'
  220 |             ? childSchema[0] as Record<string, unknown>
  221 |             : valSchema
  222 |           out[k] = walk(v, innerSchema)
  223 |         }
  224 |         return out
  225 |       }
  226 |       return enrichLeaf(obj, valSchema)
  227 |     }
  228 |     return val
  229 |   }
  230 | 
  231 |   return walk(data, schemaObj)
  232 | }
  233 | 
  234 | // ─── ai() main ─────────────────────────────────────────────────────────
  235 | 
  236 | export async function ai(
  237 |   instruction: string | string[],
  238 |   options: AiOptions,
  239 | ): Promise<boolean | string | number> {
  240 |   const config = resolveLLMConfig()
  241 |   const contextConfig = DEFAULT_CONTEXT_CONFIG
  242 | 
  243 |   const instructions = Array.isArray(instruction) ? instruction : [instruction]
  244 |   const snapshot = await serializePage(options.page)
  245 | 
  246 |   // Build vision context if enabled (Phase 4 feature)
  247 |   const visionContext = await buildVisionContext(
  248 |     options.page,
  249 |     snapshot,
  250 |     contextConfig.includeScreenshot,
  251 |   )
  252 | 
  253 |   for (const inst of instructions) {
  254 |     const type = options.type ?? 'action'
  255 |     const command = await callLLM(inst, snapshot, type, config, visionContext, options.schema)
  256 | 
  257 |     if (command.action === 'fail') {
  258 |       throw new Error(
  259 |         `ai() failed: ${command.reason ?? command.reasoning ?? 'unknown error'}\n` +
  260 |         `  Instruction: "${inst}"\n  confidence: ${command.confidence}`
  261 |       )
  262 |     }
  263 | 
  264 |     // Extract mode: return structured JSON directly
  265 |     if (type === 'extract') {
  266 |       if (command.extractedData === undefined) {
  267 |         throw new Error(`ai() extract: no data returned. LLM said: ${command.reasoning}`)
  268 |       }
  269 |       const flattened = flattenExtractedData(command.extractedData)
  270 |       const enriched = enrichExtractedUrls(flattened, snapshot, options.schema)
  271 |       return enriched as boolean | string | number
  272 |     }
  273 | 
  274 |     const { locator, attempts } = await resolveSelectorWithRetry(
  275 |       options.page,
  276 |       command,
  277 |     )
  278 | 
  279 |     if (!locator) {
  280 |       const errorMsg = buildSelectorError(command, snapshot, attempts)
> 281 |       throw new Error(
      |             ^ Error: ai() selector resolution failed after 9 attempts.
  282 |         `ai() selector resolution failed after ${attempts.length} attempts.\n` +
  283 |         `${errorMsg}\n  Instruction: "${inst}"`
  284 |       )
  285 |     }
  286 | 
  287 |     if (type === 'assert' || command.action === 'assert') {
  288 |       return await executeAssert(command, locator)
  289 |     } else if (type === 'query' || command.action === 'query') {
  290 |       return await executeQuery(options.page, command, locator)
  291 |     } else {
  292 |       await executeAction(command, locator, options.page)
  293 |     }
  294 |   }
  295 | 
  296 |   return true
  297 | }
  298 | 
  299 | // ─── aiNavigate — multi-page flows (Phase 4) ───────────────────────────
  300 | 
  301 | export interface PageStep {
  302 |   instruction: string
  303 |   expectedUrl?: RegExp | string
  304 |   expectedTitle?: string
  305 |   waitForSelector?: string
  306 |   type?: 'action' | 'assert' | 'query'
  307 | }
  308 | 
  309 | export interface AiNavigateResult {
  310 |   page: Page
  311 |   results: (boolean | string | number)[]
  312 |   navigatedSteps: number
  313 | }
  314 | 
  315 | export async function aiNavigate(
  316 |   steps: PageStep[],
  317 |   options: AiOptions,
  318 | ): Promise<AiNavigateResult> {
  319 |   const results: (boolean | string | number)[] = []
  320 |   let navigatedSteps = 0
  321 | 
  322 |   for (let i = 0; i < steps.length; i++) {
  323 |     const step = steps[i]
  324 | 
  325 |     // Execute the instruction
  326 |     const result = await ai(step.instruction, {
  327 |       ...options,
  328 |       type: step.type,
  329 |     })
  330 |     results.push(result)
  331 |     navigatedSteps++
  332 | 
  333 |     // Wait for navigation if expectedUrl is specified
  334 |     if (step.expectedUrl) {
  335 |       await options.page.waitForURL(step.expectedUrl).catch(() => {
  336 |         // If we navigated away, that's the expected behavior
  337 |       })
  338 |     }
  339 | 
  340 |     // Wait for selector if specified
  341 |     if (step.waitForSelector) {
  342 |       await options.page.waitForSelector(step.waitForSelector, { timeout: 5000 }).catch(() => {
  343 |         // Element may not have appeared
  344 |       })
  345 |     }
  346 | 
  347 |     // Re-serialize DOM for next step (handled automatically in next ai() call)
  348 |   }
  349 | 
  350 |   return { page: options.page, results, navigatedSteps }
  351 | }
  352 | 
  353 | // ─── Exports ───────────────────────────────────────────────────────────
  354 | 
  355 | export { captureScreenshot, buildVisionContext } from './vision'
  356 | export type { VisionConfig, CapturedScreenshot, VisionPromptParts } from './vision'
```