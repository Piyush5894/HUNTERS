import { ShortNote } from '../types';

export const SEED_SHORT_NOTES: ShortNote[] = [
  {
    id: 'sn-os-1',
    title: 'Deadlock Coffman Conditions & Prevention',
    subject: 'Operating Systems',
    branch: 'CSE',
    semester: 4,
    unit: 'Unit 3: Process Synchronization & Deadlocks',
    keyConcepts: [
      'A Deadlock occurs when two or more processes are blocked waiting for an event that only another blocked process can trigger.',
      'Banker’s Algorithm is used for Deadlock Avoidance by testing for safety: Needs <= Available.',
      'Resource Allocation Graph (RAG) with a cycle guarantees deadlock ONLY if resources have single instances.'
    ],
    formulas: [
      'Need Matrix = Max Matrix - Allocation Matrix',
      'Safety Condition: Available >= Need[i]',
      'Deadlock Free Condition: Total resources >= n*(m - 1) + 1 (where n = processes, m = max demand)'
    ],
    examPitfalls: [
      'Trap: "A cycle in RAG always means deadlock." FALSE for multi-instance resources! Only true for single-instance.',
      'Avoidance vs Prevention: Prevention restricts how requests can be made; Avoidance dynamically checks state safety.'
    ],
    mnemonic: 'COFFMAN: Mutual exclusion, Hold & wait, No preemption, Circular wait (M-H-N-C)',
    quickSummary: 'Deadlock requires all 4 Coffman conditions simultaneously. Negating any single one guarantees prevention. Banker’s algorithm simulates allocation to ensure safe state sequence.',
    tags: ['Deadlock', 'Coffman', 'Bankers Algorithm', 'OS']
  },
  {
    id: 'sn-os-2',
    title: 'Paging, Segmentation & TLB Hit Time',
    subject: 'Operating Systems',
    branch: 'CSE',
    semester: 4,
    unit: 'Unit 4: Memory Management Architecture',
    keyConcepts: [
      'Paging eliminates external fragmentation by allocating fixed-size frames in physical memory.',
      'Internal fragmentation exists solely on the last page of an allocated process.',
      'Translation Lookaside Buffer (TLB) is an associative hardware cache inside the CPU MMU for fast page translation.'
    ],
    formulas: [
      'Physical Address = (Frame Number × Page Size) + Offset',
      'Effective Memory Access Time (EMAT) = h × (t_TLB + t_mem) + (1 - h) × (t_TLB + 2 × t_mem)',
      'Page Table Size = Number of Entries × Entry Size = (Logical Address Space / Page Size) × Entry Size'
    ],
    examPitfalls: [
      'Forgetting that a TLB miss causes TWO memory accesses (one for page table in RAM, one for actual operand).',
      'Confusing Frame size and Page size: They MUST be exactly identical in hardware.'
    ],
    mnemonic: 'P-I-S-E: Paging has Internal fragmentation; Segmentation has External fragmentation.',
    quickSummary: 'Pages are logical fixed blocks, Frames are physical blocks. TLB provides fast address resolution. If TLB misses, 2 memory accesses are required.',
    tags: ['Paging', 'TLB', 'Virtual Memory', 'Memory Management']
  },
  {
    id: 'sn-algo-1',
    title: 'Master Theorem for Divide & Conquer Recurrences',
    subject: 'Design and Analysis of Algorithms',
    branch: 'CSE',
    semester: 4,
    unit: 'Unit 1: Recurrence Relations & Asymptotic Notation',
    keyConcepts: [
      'Solves recurrences of form T(n) = a*T(n/b) + f(n), where a >= 1 and b > 1.',
      'Compares f(n) against n^(log_b(a)) (the critical exponent function).',
      'Governs Merge Sort (T(n)=2T(n/2)+O(n) -> O(n log n)) and Binary Search (T(n)=T(n/2)+O(1) -> O(log n)).'
    ],
    formulas: [
      'Case 1: If f(n) = O(n^(log_b(a) - ε)), then T(n) = Θ(n^(log_b(a)))',
      'Case 2: If f(n) = Θ(n^(log_b(a)) * log^k(n)), then T(n) = Θ(n^(log_b(a)) * log^(k+1)(n))',
      'Case 3: If f(n) = Ω(n^(log_b(a) + ε)) and regularity condition a*f(n/b) <= c*f(n), then T(n) = Θ(f(n))'
    ],
    examPitfalls: [
      'Master theorem CANNOT be applied if: "a" is not a constant, "b < 1", or f(n) is not polynomial (e.g. 2^n or n!).',
      'Watch out for log base: log_b(a) must use base b!'
    ],
    mnemonic: 'ABC Test: a = Subproblems count, b = Shrink factor, Critical power = log_b(a)',
    quickSummary: 'Compare f(n) with n^(log_b a). Whichever term dominates sets the overall asymptotic bound.',
    tags: ['Master Theorem', 'Algorithms', 'Complexity', 'Divide & Conquer']
  },
  {
    id: 'sn-algo-2',
    title: 'Dijkstra vs Bellman-Ford Shortest Paths',
    subject: 'Design and Analysis of Algorithms',
    branch: 'CSE',
    semester: 4,
    unit: 'Unit 3: Graph Algorithms & Greedy Strategies',
    keyConcepts: [
      'Dijkstra uses Greedy paradigm with Min-Heap priority queue.',
      'Bellman-Ford uses Dynamic Programming by relaxing all edges |V| - 1 times.',
      'Bellman-Ford is the only standard algorithm capable of detecting negative weight cycles.'
    ],
    formulas: [
      'Dijkstra Time Complexity: O((V + E) log V) with binary heap, O(V^2) with adjacency matrix',
      'Bellman-Ford Time Complexity: O(V × E)',
      'Relaxation Rule: if (dist[u] + weight(u,v) < dist[v]) then dist[v] = dist[u] + weight(u,v)'
    ],
    examPitfalls: [
      'Never apply Dijkstra on graphs with ANY negative edge weights; greedy choice property fails permanently.',
      'Running an extra |V|-th relaxation iteration in Bellman-Ford is the standard test for negative cycles.'
    ],
    mnemonic: 'D-P-G: Dijkstra = Positive weights only & Greedy; Bellman = All weights & Dynamic Programming.',
    quickSummary: 'For non-negative edges, use Dijkstra for speed. For graphs with negative weights or routing protocols (RIP), use Bellman-Ford.',
    tags: ['Dijkstra', 'Bellman-Ford', 'Graphs', 'Greedy']
  },
  {
    id: 'sn-db-1',
    title: 'Database Normalization: 1NF to BCNF',
    subject: 'Database Management Systems',
    branch: 'CSE',
    semester: 4,
    unit: 'Unit 2: Relational Schema Design & Functional Dependencies',
    keyConcepts: [
      '1NF: All attributes must have atomic (indivisible) values; no repeating groups.',
      '2NF: In 1NF and no Partial Dependency (non-prime attribute depending on proper subset of candidate key).',
      '3NF: In 2NF and no Transitive Dependency (non-prime attribute depending on another non-prime attribute).',
      'BCNF (Boyce-Codd NF): For every functional dependency X -> Y, X must be a Super Key.'
    ],
    formulas: [
      '3NF Test: For X -> Y, either X is Super Key OR Y is a Prime attribute (part of candidate key).',
      'BCNF Test: For every X -> Y, X MUST be a Super Key (strictly stronger than 3NF).'
    ],
    examPitfalls: [
      'Every relation with only 2 attributes is ALWAYS in BCNF!',
      '3NF guarantees dependency preservation and lossless join; BCNF guarantees lossless join but may not preserve all FDs.'
    ],
    mnemonic: 'The Key, the Whole Key, and Nothing but the Key (so help me Codd): 1NF=Atomic, 2NF=Whole Key, 3NF=Nothing but the Key.',
    quickSummary: 'Normalization systematically eliminates insertion, update, and deletion anomalies while ensuring lossless joins.',
    tags: ['DBMS', 'Normalization', '1NF', '2NF', '3NF', 'BCNF']
  },
  {
    id: 'sn-cn-1',
    title: 'OSI vs TCP/IP Layers & Protocols',
    subject: 'Computer Networks',
    branch: 'CSE',
    semester: 5,
    unit: 'Unit 1: Protocol Architectures & Physical Layer',
    keyConcepts: [
      'OSI Model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
      'TCP/IP Protocol Suite has 4/5 layers combining Session/Presentation into Application.',
      'Data Units: Bits (L1) -> Frames (L2) -> Packets (L3) -> Segments (L4) -> Data (L5-7).'
    ],
    formulas: [
      'Subnet Mask Host Count = 2^(32 - Prefix) - 2 (subtract Network & Broadcast addresses)',
      'Propagation Delay = Distance / Propagation Speed',
      'Transmission Delay = Packet Size (bits) / Bandwidth (bps)'
    ],
    examPitfalls: [
      'MAC address operates at Layer 2 (Data Link); IP address operates at Layer 3 (Network); Port operates at Layer 4 (Transport).',
      'Hub is L1 (Physical broadcast); Switch is L2 (Frame forwarding); Router is L3 (Packet routing).'
    ],
    mnemonic: 'Please Do Not Throw Sausage Pizza Away (Physical, Data Link, Network, Transport, Session, Presentation, Application)',
    quickSummary: 'OSI is theoretical reference framework; TCP/IP is actual implemented internet architecture. Hubs work at L1, Switches at L2, Routers at L3.',
    tags: ['Networks', 'OSI', 'TCP/IP', 'Subnetting']
  },
  {
    id: 'sn-ee-1',
    title: 'Kirchhoff’s Laws & Network Theorems',
    subject: 'Basic Electrical Engineering',
    branch: 'EEE',
    semester: 1,
    unit: 'Unit 1: DC Circuit Analysis & Theorems',
    keyConcepts: [
      'KCL: Algebraic sum of currents entering any node equals zero (Conservation of Charge).',
      'KVL: Algebraic sum of potential differences around any closed mesh equals zero (Conservation of Energy).',
      'Thevenin Theorem: Any linear two-terminal circuit can be replaced by an equivalent voltage source V_th in series with resistance R_th.',
      'Norton Theorem: Equivalent current source I_n in parallel with resistance R_n (where R_n = R_th and I_n = V_th / R_th).'
    ],
    formulas: [
      'KCL: Σ I_in = Σ I_out',
      'KVL: Σ V = 0',
      'Maximum Power Transfer Theorem: P_max = (V_th)^2 / (4 * R_L) when R_L = R_th'
    ],
    examPitfalls: [
      'When calculating Thevenin resistance R_th: Deactivate independent voltage sources by SHORT-CIRCUITING them, and current sources by OPEN-CIRCUITING them.',
      'Max Power Transfer condition requires R_L = R_th; efficiency is only 50% at maximum power transfer!'
    ],
    mnemonic: 'V-S-O-C: Voltage source Shorted, Current source Opened when calculating R_th.',
    quickSummary: 'KCL is charge conservation; KVL is energy conservation. Thevenin/Norton simplify complex linear networks into a single source and internal resistance.',
    tags: ['KCL', 'KVL', 'Thevenin', 'Norton', 'Electrical Circuits']
  },
  {
    id: 'sn-me-1',
    title: 'First & Second Laws of Thermodynamics & Carnot Cycle',
    subject: 'Thermodynamics',
    branch: 'MECH',
    semester: 3,
    unit: 'Unit 2: Second Law & Entropy Analysis',
    keyConcepts: [
      '1st Law (Joule): Energy cannot be created or destroyed; dQ = dU + dW.',
      '2nd Law (Kelvin-Planck): Impossible to construct a heat engine operating in a cycle that absorbs heat and converts 100% into work without discharging heat to a cooler reservoir.',
      '2nd Law (Clausius): Impossible for heat to flow spontaneously from cooler body to hotter body without external work.',
      'Carnot Engine operates between two thermal reservoirs using 2 reversible isothermals and 2 reversible adiabatics.'
    ],
    formulas: [
      '1st Law for Closed System: Q - W = ΔU = m*Cv*(T2 - T1)',
      'Carnot Efficiency: η_carnot = 1 - (T_L / T_H) = (T_H - T_L) / T_H (temperatures MUST be in Kelvin!)',
      'Clausius Inequality: ∮ (dQ / T) <= 0 (equals 0 for reversible, < 0 for irreversible cycle)'
    ],
    examPitfalls: [
      'HUGE mark deduction trap: Forgetting to convert Celsius to Kelvin (K = °C + 273.15) in Carnot efficiency calculations!',
      'Work in adiabatic process: W = (P1*V1 - P2*V2) / (γ - 1).'
    ],
    mnemonic: 'K-C-P: Kelvin-Planck = Engines cannot be 100% efficient; Clausius = Refrigerators require work input.',
    quickSummary: 'Carnot cycle represents maximum theoretical efficiency between two temperatures. Temperatures must be in absolute Kelvin.',
    tags: ['Thermodynamics', 'Carnot', 'First Law', 'Entropy']
  },
  {
    id: 'sn-me-2',
    title: 'Euler-Bernoulli Beam Bending & Flexure Formula',
    subject: 'Strength of Materials',
    branch: 'CIVIL',
    semester: 3,
    unit: 'Unit 3: Bending Stresses in Beams',
    keyConcepts: [
      'Governs pure bending in beams when shear force is zero.',
      'Neutral Axis (NA) passes through the centroid of cross-section; bending stress at NA is ZERO.',
      'Bending stress varies linearly with distance y from neutral axis (max tension at bottom, max compression at top for positive sagging moment).'
    ],
    formulas: [
      'Bending Equation: M / I = σ / y = E / R',
      'Section Modulus: Z = I / y_max',
      'Maximum Bending Stress: σ_max = M / Z',
      'Moment of Inertia for Rectangular Section (b × d): I_NA = (b * d^3) / 12'
    ],
    examPitfalls: [
      'For rectangular beam: I_NA is (b*d^3)/12 about horizontal neutral axis, NOT (d*b^3)/12. The depth "d" is cubed!',
      'Beams of uniform strength have constant maximum bending stress σ throughout their span.'
    ],
    mnemonic: 'M-I-S-Y-E-R: "My Insane Sister Yells Every Road" -> M/I = σ/y = E/R',
    quickSummary: 'Bending stress σ is zero at Neutral Axis and maximum at outer fibers. Moment capacity is directly proportional to Section Modulus Z = I/y.',
    tags: ['Flexure', 'Euler Bernoulli', 'Beam Bending', 'Strength of Materials']
  },
  {
    id: 'sn-math-1',
    title: 'Laplace Transform High-Yield Formulas Table',
    subject: 'Engineering Mathematics',
    branch: 'FIRST_YEAR',
    semester: 2,
    unit: 'Unit 4: Differential Equations & Transforms',
    keyConcepts: [
      'Transforms time-domain differential equations into algebraic equations in complex frequency s-domain.',
      'Defined as L{f(t)} = ∫[0 to ∞] e^(-st) f(t) dt.',
      'First Shifting Property: If L{f(t)} = F(s), then L{e^(at) f(t)} = F(s - a).'
    ],
    formulas: [
      'L{1} = 1 / s',
      'L{t^n} = n! / s^(n+1) (for positive integer n)',
      'L{e^(at)} = 1 / (s - a)',
      'L{sin(at)} = a / (s^2 + a^2)',
      'L{cos(at)} = s / (s^2 + a^2)',
      'L{sinh(at)} = a / (s^2 - a^2)',
      'L{cosh(at)} = s / (s^2 - a^2)',
      'L{f\'(t)} = s*F(s) - f(0)'
    ],
    examPitfalls: [
      'Sign error trap: sin and cos have "+" in denominator (s^2 + a^2); sinh and cosh have "-" (s^2 - a^2)!',
      'cos and cosh have "s" in numerator; sin and sinh have "a" in numerator.'
    ],
    mnemonic: 'COS has S on top (cos -> s/(s^2+a^2)). Hyperbolics have Hyphens/minus in denominator.',
    quickSummary: 'Laplace transforms convert ODEs into algebraic s-domain equations. Watch out for + vs - signs in circular vs hyperbolic functions.',
    tags: ['Laplace Transform', 'Mathematics', 'Differential Equations', 'Transforms']
  }
];
