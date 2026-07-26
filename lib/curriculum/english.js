// 영어(문법 위주) 정적 문제은행 — AI 생성 실패/키 없음 시 폴백용. 학년별 난이도별 10문항.
const english = {
  초5: {
    concept: {
      title: "개념: be동사와 일반동사, 인칭대명사",
      body:
        "be동사는 I am / You are / He(She/It) is / We·They are 로 씁니다.\n" +
        "일반동사는 주어가 3인칭 단수(He/She/It)일 때 동사에 -s를 붙여요. 예) He plays.\n" +
        "명사의 복수형은 대개 -s를 붙이지만 child→children 처럼 불규칙도 있어요.",
    },
    levels: {
      하: [
        { id: 1, type: "mcq", q: "I ___ a student.", choices: ["am", "is", "are", "be"], answer: "am", explain: "주어가 I일 때 be동사는 am." },
        { id: 2, type: "mcq", q: "She ___ happy.", choices: ["is", "am", "are", "be"], answer: "is", explain: "주어가 She일 때 be동사는 is." },
        { id: 3, type: "mcq", q: "They ___ my friends.", choices: ["are", "is", "am", "be"], answer: "are", explain: "주어가 They일 때 be동사는 are." },
        { id: 4, type: "short", q: "명사 'book'의 복수형을 쓰시오.", answer: "books", explain: "대부분 명사는 -s를 붙여요." },
        { id: 5, type: "mcq", q: "He ___ soccer every day.", choices: ["plays", "play", "playing", "played"], answer: "plays", explain: "3인칭 단수 주어는 동사에 -s." },
        { id: 6, type: "mcq", q: "___ this ___ apple?", choices: ["Is / an", "Is / a", "Are / an", "Do / a"], answer: "Is / an", explain: "모음 앞엔 an, be동사 의문문은 Is로 시작." },
        { id: 7, type: "short", q: "빈칸: 'It ___ a dog.' (be동사)", answer: "is", explain: "It은 is." },
        { id: 8, type: "mcq", q: "___ name is Tom.", choices: ["My", "I", "Me", "Mine"], answer: "My", explain: "'나의'는 소유격 My." },
        { id: 9, type: "mcq", q: "This is ___ orange.", choices: ["an", "a", "the", "x"], answer: "an", explain: "모음(o) 앞에는 an." },
        { id: 10, type: "short", q: "'cat'의 복수형을 쓰시오.", answer: "cats", explain: "-s를 붙여 cats." },
      ],
      중: [
        { id: 1, type: "mcq", q: "She ___ not like fish.", choices: ["does", "do", "is", "are"], answer: "does", explain: "3인칭 단수 부정문은 does not." },
        { id: 2, type: "mcq", q: "We ___ playing now.", choices: ["are", "is", "am", "be"], answer: "are", explain: "We + are + ~ing (현재진행)." },
        { id: 3, type: "mcq", q: "다음 중 복수형이 틀린 것은?", choices: ["foots", "cats", "dogs", "books"], answer: "foots", explain: "foot의 복수형은 feet." },
        { id: 4, type: "short", q: "'child'의 복수형을 쓰시오.", answer: "children", explain: "child는 불규칙 복수형 children." },
        { id: 5, type: "mcq", q: "___ she your sister?", choices: ["Is", "Are", "Do", "Does"], answer: "Is", explain: "She + be동사 의문문은 Is." },
        { id: 6, type: "mcq", q: "He ___ to school by bus.", choices: ["goes", "go", "going", "gone"], answer: "goes", explain: "3인칭 단수는 goes." },
        { id: 7, type: "short", q: "빈칸에 알맞은 대명사: 'Tom is tall. ___ is my friend.'", answer: "He", explain: "Tom을 대신하는 주격 대명사 He." },
        { id: 8, type: "mcq", q: "There ___ many books on the desk.", choices: ["are", "is", "am", "be"], answer: "are", explain: "복수(many books)에는 There are." },
        { id: 9, type: "mcq", q: "I ___ TV yesterday.", choices: ["watched", "watch", "watches", "watching"], answer: "watched", explain: "yesterday는 과거 → watched." },
        { id: 10, type: "short", q: "a 또는 an: '___ egg'", answer: "an", explain: "모음(e) 앞에는 an." },
      ],
      상: [
        { id: 1, type: "mcq", q: "She ___ her homework now.", choices: ["is doing", "do", "does", "did"], answer: "is doing", explain: "now → 현재진행 is doing." },
        { id: 2, type: "mcq", q: "동사 'go'의 과거형은?", choices: ["went", "goed", "gone", "going"], answer: "went", explain: "go의 과거형은 went (불규칙)." },
        { id: 3, type: "short", q: "'leaf'의 복수형을 쓰시오.", answer: "leaves", explain: "-f로 끝나면 -ves: leaves." },
        { id: 4, type: "mcq", q: "___ he play the piano?", choices: ["Does", "Do", "Is", "Are"], answer: "Does", explain: "3인칭 단수 일반동사 의문문은 Does." },
        { id: 5, type: "mcq", q: "They ___ to the park last Sunday.", choices: ["went", "go", "goes", "going"], answer: "went", explain: "last Sunday → 과거 went." },
        { id: 6, type: "short", q: "'mouse'의 복수형을 쓰시오.", answer: "mice", explain: "mouse는 불규칙 복수형 mice." },
        { id: 7, type: "mcq", q: "This book is ___. (내 것)", choices: ["mine", "my", "me", "I"], answer: "mine", explain: "'내 것'은 소유대명사 mine." },
        { id: 8, type: "mcq", q: "He is taller ___ me.", choices: ["than", "then", "to", "as"], answer: "than", explain: "비교급 뒤에는 than." },
        { id: 9, type: "short", q: "'You are happy.'를 의문문으로 바꿔 쓰시오.", answer: "Are you happy?", explain: "be동사를 주어 앞으로: Are you happy?" },
        { id: 10, type: "mcq", q: "I don't have ___ money.", choices: ["any", "some", "a", "an"], answer: "any", explain: "부정문에는 any를 써요." },
      ],
    },
  },

  초6: {
    concept: {
      title: "개념: 3인칭 단수, 현재진행, 과거시제, 비교급",
      body:
        "현재진행형은 be동사 + 동사-ing (He is running).\n" +
        "규칙동사의 과거형은 -ed를 붙여요 (play→played, want→wanted).\n" +
        "비교급은 형용사 + -er + than (taller than), 조동사 can 뒤에는 동사원형을 써요.",
    },
    levels: {
      하: [
        { id: 1, type: "mcq", q: "He ___ a book now.", choices: ["is reading", "read", "reads", "reading"], answer: "is reading", explain: "now → 현재진행 is reading." },
        { id: 2, type: "mcq", q: "I ___ soccer yesterday.", choices: ["played", "play", "plays", "playing"], answer: "played", explain: "yesterday → 과거 played." },
        { id: 3, type: "mcq", q: "She ___ swim well.", choices: ["can", "cans", "to", "is"], answer: "can", explain: "조동사 can + 동사원형." },
        { id: 4, type: "short", q: "'study'의 3인칭 단수형(He ___)을 쓰시오.", answer: "studies", explain: "자음+y는 y→ies: studies." },
        { id: 5, type: "mcq", q: "Tom is ___ than Sam.", choices: ["taller", "tall", "tallest", "more tall"], answer: "taller", explain: "비교급 taller + than." },
        { id: 6, type: "mcq", q: "They ___ watching TV.", choices: ["are", "is", "am", "does"], answer: "are", explain: "They + are + ~ing." },
        { id: 7, type: "short", q: "'go'의 과거형을 쓰시오.", answer: "went", explain: "go의 과거형은 went." },
        { id: 8, type: "mcq", q: "___ you play the guitar?", choices: ["Can", "Are", "Is", "Does"], answer: "Can", explain: "'할 수 있니?'는 Can you ~?" },
        { id: 9, type: "mcq", q: "We ___ happy yesterday.", choices: ["were", "are", "was", "is"], answer: "were", explain: "We의 과거 be동사는 were." },
        { id: 10, type: "short", q: "'big'의 비교급을 쓰시오.", answer: "bigger", explain: "단모음+단자음은 자음 하나 더: bigger." },
      ],
      중: [
        { id: 1, type: "mcq", q: "She ___ to music now.", choices: ["is listening", "listens", "listen", "listened"], answer: "is listening", explain: "now → 현재진행." },
        { id: 2, type: "mcq", q: "He ___ his homework an hour ago.", choices: ["did", "does", "do", "doing"], answer: "did", explain: "ago → 과거, do의 과거는 did." },
        { id: 3, type: "short", q: "'have'의 과거형을 쓰시오.", answer: "had", explain: "have의 과거형은 had." },
        { id: 4, type: "mcq", q: "This is ___ book of the three.", choices: ["the biggest", "bigger", "big", "more big"], answer: "the biggest", explain: "셋 중 가장 → 최상급 the biggest." },
        { id: 5, type: "mcq", q: "___ she going to visit us?", choices: ["Is", "Does", "Do", "Are"], answer: "Is", explain: "be going to 의문문, She → Is." },
        { id: 6, type: "short", q: "'run'의 -ing형을 쓰시오.", answer: "running", explain: "단모음+단자음은 자음 하나 더: running." },
        { id: 7, type: "mcq", q: "Where ___ you go last night?", choices: ["did", "do", "does", "are"], answer: "did", explain: "과거 의문문은 did + 동사원형." },
        { id: 8, type: "mcq", q: "A cheetah is ___ than a cat.", choices: ["faster", "fast", "fastest", "more fast"], answer: "faster", explain: "비교급 faster + than." },
        { id: 9, type: "short", q: "'They ___ (be) at home yesterday.' 빈칸을 채우시오.", answer: "were", explain: "They의 과거 be동사는 were." },
        { id: 10, type: "mcq", q: "I ___ not go to school on Sundays.", choices: ["do", "does", "am", "is"], answer: "do", explain: "I의 부정문은 do not." },
      ],
      상: [
        { id: 1, type: "mcq", q: "She ___ going to travel next week.", choices: ["is", "does", "do", "are"], answer: "is", explain: "be going to 미래, She → is." },
        { id: 2, type: "short", q: "'The movie is ___ (interesting) than the book.' 비교급으로 채우시오.", answer: "more interesting", explain: "긴 형용사는 more + 원급." },
        { id: 3, type: "mcq", q: "He ___ swim when he was five.", choices: ["could", "can", "cans", "is"], answer: "could", explain: "과거의 능력은 could." },
        { id: 4, type: "short", q: "'buy'의 과거형을 쓰시오.", answer: "bought", explain: "buy의 과거형은 bought (불규칙)." },
        { id: 5, type: "mcq", q: "What ___ you doing now?", choices: ["are", "do", "does", "did"], answer: "are", explain: "현재진행 의문문: What are you doing?" },
        { id: 6, type: "mcq", q: "This is the ___ story I've ever read.", choices: ["most exciting", "exciting", "more exciting", "excitingest"], answer: "most exciting", explain: "긴 형용사 최상급은 the most + 원급." },
        { id: 7, type: "short", q: "'You went there.'를 의문문으로 바꿔 쓰시오.", answer: "Did you go there?", explain: "과거 일반동사 의문문: Did + 주어 + 동사원형?" },
        { id: 8, type: "mcq", q: "There ___ some milk in the glass.", choices: ["is", "are", "am", "be"], answer: "is", explain: "milk는 셀 수 없어 단수 취급 → is." },
        { id: 9, type: "short", q: "'good'의 비교급을 쓰시오.", answer: "better", explain: "good의 비교급은 better (불규칙)." },
        { id: 10, type: "mcq", q: "He ___ TV when I came home.", choices: ["was watching", "watches", "watch", "is watching"], answer: "was watching", explain: "과거의 특정 시점 진행 → 과거진행 was watching." },
      ],
    },
  },

  중1: {
    concept: {
      title: "개념: 시제, 조동사, 비교급, There is/are",
      body:
        "미래는 will + 동사원형, 또는 be going to + 동사원형으로 표현해요.\n" +
        "조동사(can/must/should) 뒤에는 항상 동사원형을 씁니다.\n" +
        "비교급은 -er/more, 최상급은 -est/most, There is(단수)/There are(복수).",
    },
    levels: {
      하: [
        { id: 1, type: "mcq", q: "I ___ visit my grandmother tomorrow.", choices: ["will", "am", "was", "did"], answer: "will", explain: "tomorrow → 미래 will." },
        { id: 2, type: "mcq", q: "You ___ finish your homework first.", choices: ["must", "musts", "to", "are"], answer: "must", explain: "조동사 must + 동사원형." },
        { id: 3, type: "short", q: "'eat'의 과거형을 쓰시오.", answer: "ate", explain: "eat의 과거형은 ate (불규칙)." },
        { id: 4, type: "mcq", q: "There ___ two apples on the table.", choices: ["are", "is", "am", "be"], answer: "are", explain: "복수 → There are." },
        { id: 5, type: "mcq", q: "She is ___ than her brother.", choices: ["smarter", "smart", "smartest", "more smart"], answer: "smarter", explain: "비교급 smarter + than." },
        { id: 6, type: "mcq", q: "He ___ study hard for the exam.", choices: ["should", "shoulds", "is", "to"], answer: "should", explain: "충고의 조동사 should + 동사원형." },
        { id: 7, type: "short", q: "'see'의 과거형을 쓰시오.", answer: "saw", explain: "see의 과거형은 saw (불규칙)." },
        { id: 8, type: "mcq", q: "___ there any water in the bottle?", choices: ["Is", "Are", "Do", "Does"], answer: "Is", explain: "water는 셀 수 없어 단수 → Is there?" },
        { id: 9, type: "mcq", q: "We ___ going to watch a movie.", choices: ["are", "is", "am", "does"], answer: "are", explain: "We + are going to." },
        { id: 10, type: "short", q: "'fast'의 최상급을 쓰시오. (the ___)", answer: "fastest", explain: "짧은 형용사 최상급은 -est: fastest." },
      ],
      중: [
        { id: 1, type: "mcq", q: "___ you help me tomorrow?", choices: ["Will", "Are", "Do", "Did"], answer: "Will", explain: "미래 의문문: Will you ~?" },
        { id: 2, type: "short", q: "'write'의 과거형을 쓰시오.", answer: "wrote", explain: "write의 과거형은 wrote (불규칙)." },
        { id: 3, type: "mcq", q: "This box is ___ than that one.", choices: ["heavier", "heavy", "heaviest", "more heavy"], answer: "heavier", explain: "자음+y는 y→ier: heavier." },
        { id: 4, type: "mcq", q: "He ___ not come to the party last night.", choices: ["did", "does", "do", "was"], answer: "did", explain: "과거 부정문은 did not." },
        { id: 5, type: "short", q: "'This is ___ (good) book I have.' 최상급으로 채우시오. (the ___)", answer: "the best", explain: "good의 최상급은 best." },
        { id: 6, type: "mcq", q: "There ___ a lot of people in the park.", choices: ["are", "is", "am", "be"], answer: "are", explain: "people은 복수 취급 → are." },
        { id: 7, type: "mcq", q: "You ___ not run in the classroom.", choices: ["must", "musts", "are", "do"], answer: "must", explain: "must not = 금지." },
        { id: 8, type: "short", q: "'take'의 과거형을 쓰시오.", answer: "took", explain: "take의 과거형은 took (불규칙)." },
        { id: 9, type: "mcq", q: "It ___ rain tomorrow.", choices: ["will", "is", "was", "did"], answer: "will", explain: "tomorrow → 미래 will." },
        { id: 10, type: "mcq", q: "A train is ___ than a bike.", choices: ["faster", "fast", "fastest", "more fast"], answer: "faster", explain: "비교급 faster + than." },
      ],
      상: [
        { id: 1, type: "mcq", q: "He ___ able to solve the problem.", choices: ["was", "did", "does", "is not"], answer: "was", explain: "was able to = 과거에 ~할 수 있었다." },
        { id: 2, type: "short", q: "'Mt. Everest is the ___ (high) mountain.' 최상급으로 채우시오.", answer: "highest", explain: "high의 최상급은 highest." },
        { id: 3, type: "mcq", q: "What ___ you going to do this weekend?", choices: ["are", "do", "did", "will"], answer: "are", explain: "be going to 의문문: What are you going to ~?" },
        { id: 4, type: "short", q: "'This book is ___ (difficult) than that one.' 비교급으로 채우시오.", answer: "more difficult", explain: "긴 형용사는 more + 원급." },
        { id: 5, type: "mcq", q: "You ___ better see a doctor.", choices: ["had", "have", "has", "did"], answer: "had", explain: "had better = ~하는 게 좋겠다." },
        { id: 6, type: "mcq", q: "There ___ little water left.", choices: ["is", "are", "am", "were"], answer: "is", explain: "water는 셀 수 없어 단수 → is." },
        { id: 7, type: "short", q: "'find'의 과거형을 쓰시오.", answer: "found", explain: "find의 과거형은 found (불규칙)." },
        { id: 8, type: "mcq", q: "She runs ___ than me.", choices: ["faster", "fast", "fastest", "more fast"], answer: "faster", explain: "부사 비교급 faster + than." },
        { id: 9, type: "short", q: "'They will come.'을 부정문으로 바꿔 쓰시오.", answer: "They will not come.", explain: "will 뒤에 not: will not come." },
        { id: 10, type: "mcq", q: "I must ___ my room now.", choices: ["clean", "cleans", "cleaned", "cleaning"], answer: "clean", explain: "조동사 must 뒤에는 동사원형." },
      ],
    },
  },

  중2: {
    concept: {
      title: "개념: 현재완료, 수동태, to부정사·동명사, 관계대명사",
      body:
        "현재완료는 have/has + 과거분사(p.p.)로 '경험·완료·계속'을 나타내요 (I have seen it).\n" +
        "수동태는 be동사 + 과거분사 (The window was broken).\n" +
        "관계대명사 who(사람)·which(사물)·that로 두 문장을 연결해요.",
    },
    levels: {
      하: [
        { id: 1, type: "mcq", q: "I have ___ this movie before.", choices: ["seen", "see", "saw", "seeing"], answer: "seen", explain: "현재완료는 have + 과거분사(seen)." },
        { id: 2, type: "mcq", q: "The letter ___ written by Tom.", choices: ["was", "did", "does", "has"], answer: "was", explain: "수동태는 be동사 + p.p." },
        { id: 3, type: "mcq", q: "I want ___ a doctor.", choices: ["to be", "be", "being", "am"], answer: "to be", explain: "want + to부정사." },
        { id: 4, type: "short", q: "'go'의 과거분사(p.p.)를 쓰시오.", answer: "gone", explain: "go - went - gone." },
        { id: 5, type: "mcq", q: "He enjoys ___ soccer.", choices: ["playing", "to play", "play", "played"], answer: "playing", explain: "enjoy + 동명사(-ing)." },
        { id: 6, type: "mcq", q: "The boy ___ is running is my brother.", choices: ["who", "which", "what", "whose"], answer: "who", explain: "사람 선행사 → 관계대명사 who." },
        { id: 7, type: "short", q: "'eat'의 과거분사(p.p.)를 쓰시오.", answer: "eaten", explain: "eat - ate - eaten." },
        { id: 8, type: "mcq", q: "This book ___ by many people.", choices: ["is read", "reads", "read", "reading"], answer: "is read", explain: "수동태 현재: is + p.p.(read)." },
        { id: 9, type: "mcq", q: "She decided ___ English hard.", choices: ["to study", "study", "studying", "studied"], answer: "to study", explain: "decide + to부정사." },
        { id: 10, type: "short", q: "'see'의 과거분사(p.p.)를 쓰시오.", answer: "seen", explain: "see - saw - seen." },
      ],
      중: [
        { id: 1, type: "mcq", q: "They ___ lived here for ten years.", choices: ["have", "has", "was", "did"], answer: "have", explain: "계속을 나타내는 현재완료 have + p.p." },
        { id: 2, type: "mcq", q: "The house ___ built in 1990.", choices: ["was", "is", "has", "did"], answer: "was", explain: "과거 수동태: was + p.p." },
        { id: 3, type: "short", q: "'I finished ___ (do) my homework.' 빈칸을 알맞은 형태로 쓰시오.", answer: "doing", explain: "finish + 동명사: doing." },
        { id: 4, type: "mcq", q: "I have a friend ___ lives in Busan.", choices: ["who", "which", "what", "whom"], answer: "who", explain: "사람 선행사 주격 → who." },
        { id: 5, type: "mcq", q: "This is the book ___ I bought yesterday.", choices: ["which", "who", "what", "whose"], answer: "which", explain: "사물 선행사 → which." },
        { id: 6, type: "short", q: "'write'의 과거분사(p.p.)를 쓰시오.", answer: "written", explain: "write - wrote - written." },
        { id: 7, type: "mcq", q: "He is good at ___ pictures.", choices: ["drawing", "to draw", "draw", "drew"], answer: "drawing", explain: "전치사 at 뒤에는 동명사." },
        { id: 8, type: "mcq", q: "Have you ever ___ to Japan?", choices: ["been", "gone", "go", "went"], answer: "been", explain: "경험을 물을 때 have been to." },
        { id: 9, type: "short", q: "'My homework ___ (finish) already.' 현재완료 수동으로 채우시오. (has been ___)", answer: "finished", explain: "has been + p.p.(finished)." },
        { id: 10, type: "mcq", q: "I hope ___ you again.", choices: ["to see", "seeing", "see", "saw"], answer: "to see", explain: "hope + to부정사." },
      ],
      상: [
        { id: 1, type: "mcq", q: "She has ___ her homework yet.", choices: ["not finished", "not finish", "no finish", "didn't finish"], answer: "not finished", explain: "현재완료 부정: has not + p.p." },
        { id: 2, type: "short", q: "'Tom broke the window.'를 수동태로 바꿔 쓰시오.", answer: "The window was broken by Tom.", explain: "목적어를 주어로, be동사 + p.p." },
        { id: 3, type: "mcq", q: "The girl ___ mother is a teacher is my friend.", choices: ["whose", "who", "which", "that"], answer: "whose", explain: "소유격 관계대명사 whose." },
        { id: 4, type: "mcq", q: "It is important ___ books.", choices: ["to read", "reading", "read", "reads"], answer: "to read", explain: "It is + 형용사 + to부정사." },
        { id: 5, type: "short", q: "'know'의 과거분사(p.p.)를 쓰시오.", answer: "known", explain: "know - knew - known." },
        { id: 6, type: "mcq", q: "He stopped ___ because he was tired.", choices: ["walking", "to walk", "walk", "walked"], answer: "walking", explain: "stop + 동명사 = ~하던 것을 멈추다." },
        { id: 7, type: "mcq", q: "English ___ all over the world.", choices: ["is spoken", "speaks", "spoke", "speaking"], answer: "is spoken", explain: "현재 수동태: is + p.p.(spoken)." },
        { id: 8, type: "short", q: "'I have known him ___ 2015.' since/for 중 알맞은 것을 쓰시오.", answer: "since", explain: "특정 시점(2015)에는 since." },
        { id: 9, type: "mcq", q: "This is the movie ___ made him famous.", choices: ["which", "who", "whom", "whose"], answer: "which", explain: "사물 선행사 주격 → which(또는 that)." },
        { id: 10, type: "mcq", q: "Would you mind ___ the door?", choices: ["opening", "to open", "open", "opened"], answer: "opening", explain: "mind + 동명사." },
      ],
    },
  },
};

export default english;
