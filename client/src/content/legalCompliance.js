export const LEGAL_COMPLIANCE = [
  {
    part: "PART 1 — COPYRIGHT ACT 1957 COMPLIANCE",
    sections: [
      {
        title: "Section 13 — Works Covered",
        content: "ProofStamp currently handles raster images. Under Section 13, copyright subsists in artistic works, which under Section 2(c)(i) explicitly includes photographs. ProofStamp's current validated use case — stock photographers — is squarely within Section 13's protected works. Full compliance. No gap.\n\nWhen ProofStamp expands to video, audio, and written content, those works also fall under Section 13 — cinematograph films, sound recordings, and literary works respectively. The legal framework already covers the expansion roadmap."
      },
      {
        title: "Section 17 — First Owner of Copyright",
        content: "This is your strongest statutory foundation and your most significant compliance risk simultaneously.\n\nThe default rule: the author is the first owner of copyright. ProofStamp's timestamp establishes who the author is and when they created the work. Full alignment with the default rule.\n\nThe proviso risk — Section 17(b): if a photograph is taken for valuable consideration at the instance of another person, that person is the first owner — not the photographer — unless there is an agreement to the contrary. A commissioned photographer who stamps their client's product photo on ProofStamp is timestamping a work they do not own under Section 17(b). ProofStamp's certificate would name them as the creator — technically accurate — but the copyright owner is actually the commissioning party.\n\nThe proviso risk — Section 17(c): works made in the course of employment under a contract of service belong to the employer. A staff photographer at a media company owns nothing they shoot on assignment.\n\nCompliance position: ProofStamp does not make ownership determinations. It timestamps possession and identity. The certificate correctly states who had the file and when — it does not assert that this person is the copyright owner. The distinction between creator and copyright owner must be stated clearly in the ToS and on the certificate itself. Current status: this distinction needs to be explicitly written into the certificate language if it is not already there. This is a documentation gap, not a technical gap."
      },
      {
        title: "Section 45 and 48 — Copyright Registration",
        content: "Section 45: registration is optional. Section 48: the Register of Copyrights is only prima facie evidence — rebuttable by contrary evidence.\n\nThis is directly in ProofStamp's favour. A Trademarkia-assisted copyright registration certificate is rebuttable. A DigiCert RFC 3161 timestamp predating the registration filing date is the rebutting evidence. The statute itself creates the legal pathway for ProofStamp's evidence to defeat a registration certificate."
      },
      {
        title: "Section 51 — Infringement Definition",
        content: "Section 51(a)(i): doing anything the exclusive right to which is conferred on the copyright owner without a licence is infringement. Section 51(b): making for sale, distributing, or importing infringing copies is infringement.\n\nProofStamp's evidence chain directly supports a Section 51 claim. The RFC 3161 timestamp establishes prior ownership. The DMCA letter and monitoring system detect the Section 51(b) act. The Counsel Evidence Pack packages the evidence for the Section 51 civil remedy under Section 55. Full alignment."
      },
      {
        title: "Section 52(1)(a) — Fair Dealing — The AI Training Open Question",
        content: "Section 52(1)(a) exempts fair dealing for private or personal use including research from infringement. This creates an unsettled question about whether AI companies can argue that training on creator content is research or private use and therefore exempt.\n\nProofStamp's AI Access Token and opt-out flag have no current statutory backing in Indian law — the Copyright Act 1957 does not recognise AI training as a distinct category of use. The opt-out is an industry standard signal via C2PA, not a legally enforceable Indian statutory right today.\n\nThis is not a ProofStamp-specific problem. It is an open question in every jurisdiction globally. The ANI vs OpenAI Delhi High Court case is the Indian test case that will set this precedent. ProofStamp's position is that it correctly establishes the creator's prior existence and stated intent for whatever legal framework emerges. If AI training is ruled infringement, the opt-out record supports the claim. If fair dealing applies, ProofStamp's timestamp still protects all other uses."
      },
      {
        title: "Section 55 — Civil Remedies",
        content: "Injunction, damages, and accounts are available where copyright is infringed. The Counsel Evidence Pack is specifically designed to support a Section 55 action. A lawyer receiving the Pack has everything needed to file: identity of the creator, timestamp of creation, hash of the original, certificate of authenticity, and evidence of the infringing copy. Full alignment."
      },
      {
        title: "Section 63 — Criminal Infringement",
        content: "Knowing infringement is punishable with imprisonment of not less than 6 months and fine not less than ₹50,000. A creator armed with a ProofStamp Counsel Evidence Pack can support not only a civil claim under Section 55 but also a criminal complaint under Section 63. The evidence standard for Section 63 is higher — knowledge of infringement must be proven. The watermark extraction from the stolen copy demonstrating the file originated from the creator's stamped work is strong evidence of knowing infringement."
      },
      {
        title: "Section 65A — Technological Measure Protection — Your Unused Weapon",
        content: "Section 65A: any person who circumvents an effective technological measure applied for the purpose of protecting rights under the Act with the intention of infringing such rights shall be punishable with imprisonment up to 2 years and fine.\n\nProofStamp's DWT-DCT watermark is a technological measure applied to protect the creator's rights. When Infringer runs a GAN-based watermark removal tool on Creator's stamped image, he is potentially committing a Section 65A offence independently of the civil infringement claim. This is a criminal provision that operates separately from Section 63.\n\nThe key word is \"effective.\" The watermark must be shown to be an effective technological measure — meaning it actually works to protect rights. The DWT-DCT embedding surviving JPEG compression, resizing, and standard Photoshop edits demonstrates effectiveness. The fact that a specialised GAN tool is required to defeat it further demonstrates it is not trivially circumventable.\n\nThis section is not currently in your pitch or knowledge base. It should be. Add it as a second legal layer against watermark removal attacks. The thief who removes your watermark may be committing a criminal offence under Section 65A in addition to civil infringement under Section 51."
      },
      {
        title: "Section 65B — Rights Management Information — Your Second Unused Weapon",
        content: "Section 65B: knowingly removing or altering Rights Management Information without authority, or distributing content knowing that Rights Management Information has been removed, is punishable with imprisonment up to 2 years and fine.\n\nSection 2(xa) defines Rights Management Information as including the title of the work, the name of the author, the name and address of the owner of rights, and terms and conditions regarding use of the rights.\n\nProofStamp's C2PA manifest embedded in every stamped image contains exactly this information — author name, Proof Passport identifier, creation timestamp, AI Access Token terms. When a thief strips the C2PA manifest before reposting the image, they are potentially committing a Section 65B offence.\n\nSection 65B also provides a civil remedy pathway — the copyright owner may avail of civil remedies under Chapter XII against persons who tamper with Rights Management Information. This is an additional cause of action beyond Section 51 infringement that ProofStamp's evidence directly supports.\n\nThis is currently not in your pitch. It should be. C2PA manifest stripping by a thief is a Section 65B offence. This is a concrete legal consequence of a specific technical act — exactly the kind of precise legal-technical connection that impresses a legal judge."
      }
    ]
  },
  {
    part: "PART 2 — BHARATIYA SAKSHYA ADHINIYAM 2023 COMPLIANCE",
    sections: [
      {
        title: "Section 63 — Electronic Record Admissibility",
        content: "BSA 2023 Section 63 is the central admissibility provision for electronic evidence in Indian courts. It replaced Section 65B of the Indian Evidence Act and follows the Supreme Court's position in Anvar P.V. vs P.K. Basheer.\n\nThe certificate has two parts. Part A is filled by the person producing the record — ProofStamp auto-generates this. Part B must be filled by an expert — ProofStamp's fully formalized Section 79A notified lab partner signs this. Both parts are operational.\n\nWithout Part B, the certificate is legally incomplete. ProofStamp has solved this. This is the single most important legal compliance achievement of the entire platform.\n\nWhat the certificate must contain under BSA 2023 Section 63: it must certify that the electronic record was produced by a computer or computer system that was operating properly, that the record was stored or transmitted in the ordinary course of the activities of the person in the lawful control of the system, and that the record is a true copy of the original. ProofStamp's auto-generated Part A covers all of these requirements.\n\nWhat courts will examine:\nThe certificate's authenticity and accuracy. The Section 79A examiner's credentials and notification status. Whether the system described in the certificate matches the system that actually generated the record — this is the circular trust problem addressed in the knowledge base. The chain of custody from original creation to court submission.\n\nCompliance gap to address: The certificate must explicitly state which computer system generated the record, that the system was operating properly, and that the electronic record is a true copy. Verify that the auto-generated Part A certificate language covers all three requirements explicitly. If it says anything vague like \"generated by ProofStamp\" without specifying the technical system, it needs to be tightened."
      }
    ]
  },
  {
    part: "PART 3 — IT ACT 2000 COMPLIANCE",
    sections: [
      {
        title: "Section 79A — Electronic Evidence Examiner Authority",
        content: "Section 79A empowers the Central Government to notify any Department, body, or agency as an Examiner of Electronic Evidence for the purpose of providing expert opinion before any court. MeitY has notified 15 labs under this provision.\n\nProofStamp's Section 79A lab partner is one of these 15 government-designated examiners. Their Part B signature is not a private expert opinion — it is an opinion from a Central Government-notified authority specifically designated for this purpose. This is the highest available non-statutory authority for electronic evidence examination in India."
      },
      {
        title: "Section 43 and 66 — Cybercrime Provisions",
        content: "Section 43: whoever without permission of the owner accesses a computer, downloads or copies data, introduces a computer contaminant, or damages a computer system is liable to pay compensation. Section 66: doing Section 43 acts dishonestly or fraudulently is punishable with imprisonment up to 3 years and fine up to ₹5 lakhs.\n\nWhen a thief downloads a creator's image and uses it without permission, Section 43 and 66 may apply in addition to copyright infringement under Section 51. ProofStamp's audit log — recording the creator's upload from their IP address and device — provides corroborating evidence for an IT Act complaint alongside the copyright infringement claim."
      },
      {
        title: "Section 65A and 65B",
        content: "Already covered under Copyright Act above. These sections are incorporated into the IT Act framework and interact with the Copyright Act provisions. The remedies are parallel and cumulative."
      }
    ]
  },
  {
    part: "PART 4 — DIGITAL PERSONAL DATA PROTECTION ACT 2023 COMPLIANCE",
    sections: [
      {
        title: "What DPDP requires and ProofStamp's position:",
        content: "Lawful purpose for processing: ProofStamp processes creator data for the purpose of creating evidentiary records — a legitimate purpose. Documented in ToS.\n\nData minimisation: ProofStamp stores SHA-256 hashes and metadata — not the content files themselves. Cloudinary holds the assets with creator-controlled access. Compliance with data minimisation principle.\n\nAadhaar OTP data: not retained post-verification per UIDAI guidelines. Compliance confirmed.\n\nRight to erasure: creators can request deletion of their ProofStamp account and records. However — and this is a genuine tension — audit logs must be retained for 10 years to support potential litigation. The DPDP right to erasure and the evidence retention requirement for legal proceedings are in conflict.\n\nThis conflict must be addressed explicitly in the ToS and privacy policy. The standard resolution: audit logs necessary for legal proceedings are retained for the statutory limitation period applicable to IP disputes — which under the Limitation Act 1963 is 3 years for civil suits, but ProofStamp's 10-year retention is justified by the longer evidentiary window for criminal proceedings under Section 63 of the Copyright Act. Document this justification explicitly.\n\nConsent: users must consent to data processing at account creation. Aadhaar eKYC requires explicit consent per UIDAI framework. Both are addressed in the current architecture.\n\nData breach notification: DPDP requires notification to the Data Protection Board and affected users in case of a personal data breach. ProofStamp needs a documented breach response procedure. This is a compliance gap — not yet visible in the architecture documentation."
      }
    ]
  },
  {
    part: "PART 5 — AADHAAR ACT 2016 AND UIDAI COMPLIANCE",
    sections: [
      {
        title: "Aadhaar Act 2016 and UIDAI circulars",
        content: "Aadhaar-based authentication is regulated under the Aadhaar Act 2016 and UIDAI circulars. Key requirements for a private entity using Aadhaar:\n\nAuthentication can only be performed by entities licensed as Authentication User Agencies by UIDAI. Setu API operates as an authorised intermediary. ProofStamp using Setu's sandbox API is in technical compliance with the architecture. Production migration requires ProofStamp to be formally onboarded as a customer of Setu's production environment, which in turn requires Setu to perform a compliance assessment.\n\nAadhaar OTP data must not be stored. ProofStamp's architecture confirms OTP data is not retained. Compliance confirmed.\n\nThe identity binding — the link between Aadhaar identity and Proof Passport — must be stored securely with appropriate access controls. This is a production hardening requirement.\n\nOne important limitation: Aadhaar authentication confirms that a person with that Aadhaar performed the action at that time. It does not confirm that the action was lawful or that the Aadhaar holder owns the copyright in the material being stamped. A person can Aadhaar-authenticate and stamp someone else's stolen work. The Aadhaar layer confirms identity, not the legitimacy of the claim. Document this clearly."
      }
    ]
  },
  {
    part: "PART 6 — INFORMATION TECHNOLOGY RULES AND INTERMEDIARY LIABILITY",
    sections: [
      {
        title: "IT Rules 2021 — Intermediary Guidelines",
        content: "ProofStamp is a platform that stores and processes user-uploaded content. It may qualify as an intermediary under the IT Act. Intermediaries must comply with due diligence requirements under IT Rules 2021 including publishing terms of service prohibiting unlawful content, appointing a Grievance Officer, and responding to lawful government requests for information.\n\nProofStamp should publish a clear ToS prohibiting users from stamping content they do not own. This is both a legal compliance requirement and a credibility measure — it creates a contractual basis to remove a user who fraudulently stamps stolen content.\n\nA Grievance Officer must be designated for receiving complaints. This is a formal compliance requirement for platforms operating in India."
      }
    ]
  },
  {
    part: "PART 7 — THE CREDIBILITY STACK — RANKED",
    sections: [
      {
        title: "Level 1 — DigiCert RFC 3161 Timestamp",
        content: "Credibility basis: issued by a WebTrust-audited, FIPS 140-2 validated, globally recognized Certificate Authority. Independently verifiable by any RFC 3161 client. Accepted in US federal and EU proceedings. Admissible as electronic evidence under BSA 2023 Section 63.\n\nCurrent credibility: high. Sandbox caveat must be disclosed."
      },
      {
        title: "Level 2 — BSA 2023 Section 63 Certificate with Section 79A Part B",
        content: "Credibility basis: Part B signed by a Central Government-notified Examiner of Electronic Evidence under IT Act 2000 Section 79A. Supported by Anvar P.V. vs P.K. Basheer Supreme Court precedent. Highest available admissibility layer for a private platform in India.\n\nCurrent credibility: maximum available to any private platform in India."
      },
      {
        title: "Level 3 — Section 65A Protected Watermark",
        content: "Credibility basis: DWT-DCT watermark is a technological measure protected under Copyright Act 1957 Section 65A. Removal is a criminal offence. Watermark survives standard processing. GAN removal leaves forensic artifacts.\n\nCurrent credibility: high for standard copying scenarios. Reduced for sophisticated adversarial attacks."
      },
      {
        title: "Level 4 — Section 65B Protected C2PA Manifest",
        content: "Credibility basis: C2PA manifest contains Rights Management Information as defined under Copyright Act 1957 Section 2(xa). Removal is a criminal offence under Section 65B. Interoperable with Adobe, Google Pixel, TikTok.\n\nCurrent credibility: high where C2PA-compliant platforms are involved. Limited where platforms strip metadata."
      },
      {
        title: "Level 5 — Aadhaar eKYC Identity Binding",
        content: "Credibility basis: Aadhaar is India's government-mandated biometric identity infrastructure. Binding a Proof Passport to an Aadhaar-verified identity is the strongest available private-sector identity assertion in India.\n\nCurrent credibility: high for identity claims. Sandbox caveat must be disclosed for production use."
      },
      {
        title: "Level 6 — Bitcoin Blockchain Anchor",
        content: "Credibility basis: immutable, decentralised, publicly verifiable. Independently verifiable using OpenTimestamps open source client without ProofStamp servers.\n\nLegal credibility: supplementary only. No statutory recognition in India."
      }
    ]
  }
];
