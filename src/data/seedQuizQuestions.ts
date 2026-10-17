import { QuizQuestion } from '../types';

export const SEED_QUIZ_QUESTIONS: QuizQuestion[] = [
  // OPERATING SYSTEMS
  {
    id: 'q-os-1',
    subject: 'Operating Systems',
    branch: 'CSE',
    semester: 4,
    topic: 'Process Synchronization & Deadlock',
    difficulty: 'Medium',
    question: 'Which of the following is NOT a necessary condition for a deadlock to occur in an operating system?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemption by higher priority process',
      'Circular Wait'
    ],
    correctIndex: 2,
    explanation: 'Deadlock requires "No Preemption" (resources cannot be forcibly confiscated from a process). If preemption is allowed, deadlocked cycles are broken immediately.',
    formulaHint: 'Remember the 4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.'
  },
  {
    id: 'q-os-2',
    subject: 'Operating Systems',
    branch: 'CSE',
    semester: 4,
    topic: 'Memory Management',
    difficulty: 'Hard',
    question: 'A system uses a 32-bit virtual address space with 4 KB page size. If each page table entry takes 4 bytes, how many levels of page table are required to keep individual page tables within a single 4 KB page?',
    options: [
      '1 Level',
      '2 Levels',
      '3 Levels',
      '4 Levels'
    ],
    correctIndex: 1,
    explanation: 'Page offset = log2(4 KB) = 12 bits. Virtual Page Number (VPN) = 32 - 12 = 20 bits. A 4 KB page holds (4096 / 4) = 1024 = 2^10 entries (10 bits per level). Thus 20 bits / 10 bits = 2 levels (Two-Level Paging).',
    formulaHint: 'Entries per page = Page Size / Entry Size. Level count = VPN bits / bits per page.'
  },
  {
    id: 'q-os-3',
    subject: 'Operating Systems',
    branch: 'CSE',
    semester: 4,
    topic: 'CPU Scheduling',
    difficulty: 'Easy',
    question: 'Which CPU scheduling algorithm is mathematically guaranteed to achieve the minimum average waiting time for a given set of stationary processes?',
    options: [
      'First-Come First-Served (FCFS)',
      'Round Robin (RR)',
      'Shortest Job First (SJF / SRTF)',
      'Priority Scheduling'
    ],
    correctIndex: 2,
    explanation: 'Shortest Job First (SJF) is provably optimal for minimizing average waiting time by scheduling processes with the shortest burst time first, moving short delays ahead of long queues.',
    formulaHint: 'Optimal waiting time = SJF. However, SJF can lead to starvation for long processes.'
  },

  // DATA STRUCTURES & ALGORITHMS
  {
    id: 'q-algo-1',
    subject: 'Design and Analysis of Algorithms',
    branch: 'CSE',
    semester: 4,
    topic: 'Graph Theory & Shortest Path',
    difficulty: 'Medium',
    question: 'Why does Dijkstra’s shortest path algorithm fail on graphs containing negative edge weights?',
    options: [
      'It causes infinite recursion in min-heap',
      'Once a vertex distance is finalized as extracted, Dijkstra assumes no shorter path to it can ever exist',
      'Priority queues cannot store negative values',
      'It increases time complexity from O(E log V) to O(V^3)'
    ],
    correctIndex: 1,
    explanation: 'Dijkstra relies on the Greedy property: once a node is settled (visited with min distance), its distance is finalized because all subsequent path extensions with positive weights can only increase distance. A negative weight violates this monotonic assumption.',
    formulaHint: 'For graphs with negative weights or negative cycles, use Bellman-Ford O(V × E).'
  },
  {
    id: 'q-algo-2',
    subject: 'Design and Analysis of Algorithms',
    branch: 'CSE',
    semester: 4,
    topic: 'Recurrence Relations',
    difficulty: 'Medium',
    question: 'According to the Master Theorem, what is the asymptotic time complexity of the recurrence relation T(n) = 2T(n/2) + n?',
    options: [
      'O(n)',
      'O(n log n)',
      'O(n^2)',
      'O(log n)'
    ],
    correctIndex: 1,
    explanation: 'Here a = 2, b = 2, and f(n) = n. The critical exponent n^(log_b a) = n^(log_2 2) = n^1. Since f(n) = Θ(n^1), this falls under Case 2 of Master Theorem, giving T(n) = Θ(n log n). This is the exact recurrence of Merge Sort.',
    formulaHint: 'Master Theorem Case 2: If f(n) = Θ(n^(log_b a)), then T(n) = Θ(n^(log_b a) * log n).'
  },

  // DATABASE MANAGEMENT SYSTEMS
  {
    id: 'q-db-1',
    subject: 'Database Management Systems',
    branch: 'CSE',
    semester: 4,
    topic: 'Normalization',
    difficulty: 'Medium',
    question: 'A relational schema R(A, B, C, D) has the functional dependencies: AB -> C, C -> D, and D -> A. What is the highest normal form satisfied by relation R?',
    options: [
      '1NF only',
      '2NF only',
      '3NF',
      'BCNF'
    ],
    correctIndex: 2,
    explanation: 'Candidate keys are (AB), (BC), and (BD). All attributes {A, B, C, D} are prime attributes! In 3NF: for every X -> Y, either X is a superkey OR Y is a prime attribute. Since every RHS attribute is prime, R is in 3NF. But in C -> D and D -> A, neither C nor D is superkey, so it violates BCNF. Thus highest NF is 3NF.',
    formulaHint: '3NF rule: X must be Super Key OR Y must be Prime attribute. BCNF: X MUST be Super Key.'
  },
  {
    id: 'q-db-2',
    subject: 'Database Management Systems',
    branch: 'CSE',
    semester: 4,
    topic: 'Transactions & Concurrency',
    difficulty: 'Easy',
    question: 'In the ACID transaction model, which component of the DBMS is primarily responsible for ensuring "Durability"?',
    options: [
      'Concurrency Control Manager',
      'Recovery Manager & Write-Ahead Logging (WAL)',
      'Query Optimizer',
      'Data Dictionary'
    ],
    correctIndex: 1,
    explanation: 'Durability ensures that once a transaction commits, its updates survive system crashes. The Recovery Manager achieves this using Write-Ahead Logging (WAL) and checkpointing to persistent disk.',
    formulaHint: 'WAL Rule: Log records must be flushed to non-volatile storage before corresponding dirty pages are written to database disk.'
  },

  // BASIC ELECTRICAL ENGINEERING
  {
    id: 'q-ee-1',
    subject: 'Basic Electrical Engineering',
    branch: 'EEE',
    semester: 1,
    topic: 'Network Theorems',
    difficulty: 'Medium',
    question: 'In a linear DC circuit, a load resistor R_L is connected across terminals with Thevenin voltage V_th = 20 V and R_th = 5 Ω. What is the maximum power that can be transferred to R_L?',
    options: [
      '10 Watts',
      '20 Watts',
      '40 Watts',
      '100 Watts'
    ],
    correctIndex: 1,
    explanation: 'Maximum power transfer occurs when R_L = R_th = 5 Ω. P_max = (V_th)^2 / (4 * R_th) = (20)^2 / (4 * 5) = 400 / 20 = 20 Watts.',
    formulaHint: 'P_max = V_th^2 / (4 * R_th) when R_L = R_th.'
  },
  {
    id: 'q-ee-2',
    subject: 'Basic Electrical Engineering',
    branch: 'EEE',
    semester: 1,
    topic: 'AC Fundamentals',
    difficulty: 'Easy',
    question: 'For a sinusoidal alternating voltage v(t) = V_m sin(ωt), what is the ratio of RMS value to Average value (Form Factor)?',
    options: [
      '1.00',
      '1.11',
      '1.414',
      '0.707'
    ],
    correctIndex: 1,
    explanation: 'V_rms = V_m / √2 ≈ 0.707 V_m. V_avg = 2 V_m / π ≈ 0.637 V_m. Form Factor = V_rms / V_avg = (V_m / √2) / (2 V_m / π) = π / (2√2) ≈ 1.11.',
    formulaHint: 'Form Factor = RMS / Average = 1.11 for pure sine wave. Peak Factor = Peak / RMS = 1.414.'
  },

  // THERMODYNAMICS
  {
    id: 'q-me-1',
    subject: 'Thermodynamics',
    branch: 'MECH',
    semester: 3,
    topic: 'Carnot Cycle & Efficiency',
    difficulty: 'Medium',
    question: 'A reversible Carnot heat engine operates between a source at 327 °C and a sink at 27 °C. What is its maximum theoretical thermal efficiency?',
    options: [
      '91.7%',
      '50.0%',
      '60.0%',
      '30.0%'
    ],
    correctIndex: 1,
    explanation: 'Temperatures must be converted to absolute Kelvin! T_source = 327 + 273 = 600 K. T_sink = 27 + 273 = 300 K. Efficiency η = 1 - (T_sink / T_source) = 1 - (300 / 600) = 1 - 0.5 = 0.5 or 50%.',
    formulaHint: 'Always convert to Kelvin first: K = °C + 273. η = 1 - (T_L / T_H).'
  },
  {
    id: 'q-me-2',
    subject: 'Thermodynamics',
    branch: 'MECH',
    semester: 3,
    topic: 'First Law of Thermodynamics',
    difficulty: 'Easy',
    question: 'During an ideal isothermal expansion of an ideal gas, which of the following statements is TRUE regarding internal energy change (ΔU)?',
    options: [
      'ΔU is positive',
      'ΔU is negative',
      'ΔU is zero',
      'ΔU equals heat added plus work done'
    ],
    correctIndex: 2,
    explanation: 'For an ideal gas, internal energy is purely a function of temperature: ΔU = m*Cv*ΔT. Since temperature is constant in an isothermal process (ΔT = 0), ΔU = 0. Therefore, Q = W.',
    formulaHint: 'For ideal gas: ΔU = m*Cv*ΔT. In isothermal process ΔT = 0, so ΔU = 0.'
  },

  // STRENGTH OF MATERIALS
  {
    id: 'q-som-1',
    subject: 'Strength of Materials',
    branch: 'CIVIL',
    semester: 3,
    topic: 'Bending Stresses',
    difficulty: 'Medium',
    question: 'A rectangular cross-section beam of width b and depth d is subjected to a bending moment M. What is the section modulus Z of the beam about its neutral axis?',
    options: [
      '(b * d^2) / 6',
      '(b * d^3) / 12',
      '(d * b^2) / 6',
      '(b * d) / 2'
    ],
    correctIndex: 0,
    explanation: 'Moment of Inertia I = (b * d^3) / 12. Maximum distance from neutral axis y_max = d / 2. Section Modulus Z = I / y_max = ((b * d^3) / 12) / (d / 2) = (b * d^2) / 6.',
    formulaHint: 'Z = I / y_max = (b*d^3/12) / (d/2) = (b*d^2) / 6.'
  },

  // ENGINEERING MATHEMATICS
  {
    id: 'q-math-1',
    subject: 'Engineering Mathematics',
    branch: 'FIRST_YEAR',
    semester: 2,
    topic: 'Laplace Transforms',
    difficulty: 'Medium',
    question: 'What is the Laplace Transform of the function f(t) = e^(3t) * sin(2t)?',
    options: [
      '2 / ((s - 3)^2 + 4)',
      '(s - 3) / ((s - 3)^2 + 4)',
      '2 / ((s + 3)^2 + 4)',
      '3 / (s^2 + 4)'
    ],
    correctIndex: 0,
    explanation: 'By First Shifting Theorem: L{e^(at) g(t)} = G(s - a). Here g(t) = sin(2t), whose Laplace transform is 2 / (s^2 + 2^2) = 2 / (s^2 + 4). Replacing s with (s - 3) yields 2 / ((s - 3)^2 + 4).',
    formulaHint: 'L{sin(at)} = a / (s^2 + a^2). First Shifting: L{e^(bt) sin(at)} = a / ((s - b)^2 + a^2).'
  },
  {
    id: 'q-math-2',
    subject: 'Engineering Mathematics',
    branch: 'FIRST_YEAR',
    semester: 1,
    topic: 'Linear Algebra & Matrices',
    difficulty: 'Hard',
    question: 'If A is a 3 × 3 matrix with eigenvalues λ = 1, 2, 3, what is the determinant of the matrix (A^2 - 2A)?',
    options: [
      '0',
      '3',
      '6',
      '-1'
    ],
    correctIndex: 0,
    explanation: 'If λ is an eigenvalue of A, the eigenvalues of f(A) are f(λ). Here f(λ) = λ^2 - 2λ. For λ=1: 1 - 2 = -1. For λ=2: 4 - 4 = 0! For λ=3: 9 - 6 = 3. Since one eigenvalue of (A^2 - 2A) is 0, the determinant (product of eigenvalues) is (-1) * 0 * 3 = 0.',
    formulaHint: 'Determinant of a matrix is equal to the product of its eigenvalues: det(M) = Π λ_i.'
  }
];
