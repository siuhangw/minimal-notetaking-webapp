### Minimal Notetaking Webapp - Product Requirements Document (PRD)  
**Version:** 0.1 (Initial Draft)  
**Last Updated:** Today  
**Author:** Your Name  

---

#### 1. **Overview**  
A lightweight, browser-based notetaking app for quick capture and retrieval of plain-text notes. Prioritizes speed, simplicity, and offline access.  

---

#### 2. **Goals**  
- Replace physical notepads with a digital tool for daily thoughts/tasks.  
- Zero setup: No accounts, no servers, no complex features.  
- Data stored entirely locally (no backend).  

---

#### 3. **Core Features**  
| Feature             | Description                                                                 | Priority |  
|---------------------|-----------------------------------------------------------------------------|----------|  
| **Create Note**     | Single button to add a new blank note. Auto-focus on text area.             | P0       |  
| **Edit Note**       | Type directly into a note. Supports basic text formatting (bold/italics via Markdown `*`). | P0       |  
| **Delete Note**     | Trash icon per note. Confirmation dialog before deletion.                   | P0       |  
| **Note List**       | Left sidebar showing all notes (sorted newest-first). Preview first 20 chars. | P0       |  
| **Search**          | Filter notes by text (title/content) in real-time.                          | P1       |  
| **Local Storage**   | All notes saved automatically to browser’s `localStorage`.                 | P0       |  

---

#### 4. **Non-Goals**  
- User accounts, sync, or cloud storage.  
- Rich text editing, images, or attachments.  
- Mobile apps (desktop-first, responsive later).  

---

#### 5. **User Interface (Wireframe)**  
```  
-----------------------------------------  
| [Search]       [+ New Note]           |  
|---------------------------------------|  
| * Grocery list...  |                   |  
| * Meeting notes... |  [Selected Note]  |  
| * Ideas...         |  Title:           |  
|                    |  -----------------|  
|                    |  Content...       |  
|                    |                   |  
|                    | [Delete]          |  
-----------------------------------------  
```  
- **Left Panel:** Note list + search bar.  
- **Right Panel:** Active note editor (title + content).  

---

#### 6. **Technical Spec**  
- **Stack:** HTML/CSS/JavaScript (Vanilla JS or [Preact](https://preactjs.com/) for minimalism).  
- **Storage:** `localStorage` (key: `notes`). Data structure:  
  ```json
  [
    {
      "id": "timestamp-123",
      "title": "Note Title",
      "content": "Note text...",
      "createdAt": 1689000000
    }
  ]
  ```  
- **Offline Support:** Works entirely offline.  

---

#### 7. **Open Questions**  
- Should we support Markdown rendering? (Yes for **bold/italics** only in V1)  
- Dark mode toggle? (P2)  
- Export notes to `.txt`? (P2)  

---

#### 8. **Next Steps**  
1. Confirm core feature priorities.  
2. Define V1 scope (P0 features only).  
3. Draft UI mockups.  

---

**Feedback Request:**  
- Are any critical features missing?  
- Should we adjust priorities?  

Let me know how you’d like to refine this!