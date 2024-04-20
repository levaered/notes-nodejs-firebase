import { db } from './firebase.js';
import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

const collectionUsers = "users";
const collectionNotes = "notes";

const generateAccessToken = (id, role) => {
    const payload = {
        id,
        role
    }
    return jwt.sign(payload, process.env.SECRET_JWT_TOKEN, { expiresIn: '24h' });
}

export const logIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        const usersCollection = collection(db, collectionUsers);
        const q = query(usersCollection, where("username", "==", username));

        const querySnapshot = await getDocs(q);


        if (querySnapshot.empty) {
            return res.status(400).json({ error: 'Username doesn\'t exists' });
        }

        const validPassword = bcrypt.compareSync(password, querySnapshot.docs[0].data().password)

        if (!validPassword) {
            return res.status(400).json({ error: 'Password is not correct' });
        }

        const token = generateAccessToken(querySnapshot.docs[0].id, querySnapshot.docs[0].data().role);
        return res.status(200).json({ message: 'User logged in successfully', token: token });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const signUp = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors });
    }

    const { username, password } = req.body;

    try {
        const usersCollection = collection(db, collectionUsers);
        const q = query(usersCollection, where("username", "==", username));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return res.status(400).json({ error: 'Username already exists' });
        } else {
            const newUserRef = doc(usersCollection);
            const newUserId = newUserRef.id;

            const hasPassword = bcrypt.hashSync(password, 7);

            await setDoc(newUserRef, {
                username: username,
                password: hasPassword,
                role: "USER"
            });

            return res.status(200).json({ message: 'User signed up successfully', userId: newUserId });
        }
    } catch (error) {
        console.error('Error signing up user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = collection(db, collectionUsers);

        const querySnapshot = await getDocs(users);

        const documentsData = [];

        querySnapshot.forEach((doc) => {
            documentsData.push(doc.data());
        });

        return res.status(200).json(documentsData);
    } catch (error) {
        console.error('Error getting documents:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const giveAdminPermissions = async (req, res) => {
    try {
        const { userid } = req.query;

        const userRef = doc(db, 'users', userid);

        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return res.status(400).json({ error: 'User with this id doesn\'t exist' });
        }

        await setDoc(userRef, { ...userDoc.data(), role: 'ADMIN' }, { merge: true });

        const token = generateAccessToken(userid, 'ADMIN');

        return res.status(200).json({ message: 'User role updated successfully', token: token });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const createNote = async (req, res) => {
    try {
        const id = req.id; // Получаем идентификатор из запроса
        const { title, content, tags } = req.body; // Получаем данные из запроса

        // Создаем ссылку на документ в коллекции "notes" с указанным идентификатором
        const noteRef = doc(db, 'notes', id);

        // Устанавливаем данные документа в Firestore с опцией merge: true
        await setDoc(noteRef, {
            notes: arrayUnion({ // Используем arrayUnion для добавления новой заметки в массив
                id: generateRandomString(10),
                title: title,
                content: content,
                date: new Date(), // Добавляем текущую дату
                tags: tags
            })
        }, { merge: true });

        return res.status(200).json({ message: 'Note created successfully' });
    } catch (error) {
        console.error('Error creating note:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllNotes = async (req, res) => {
    try {
        const id = req.id;

        const notesRef = doc(db, collectionNotes, id); 
        const notesSnapshot = await getDoc(notesRef); 

        if (!notesSnapshot.exists()) {
            return res.status(404).json({ error: 'This user doesn\'t have any notes' });
        }

        const notesData = notesSnapshot.data();
        return res.status(200).json({ notes: notesData.notes }); 
    } catch (error) {
        console.error('Error getting notes:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateNote = async (req, res) => {
    const userId = req.id;  
    const {noteid} = req.query; 
    const { title, content, tags } = req.body;

    const noteRef = doc(db, 'notes', userId);

    try {
        const noteSnap = await getDoc(noteRef);

        if (!noteSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }

        const notes = noteSnap.data().notes || [];
        const updatedNotes = notes.map(note => {
            if (note.id === noteid) {
                return { ...note, title, content, tags, lastModified: new Date() };
            }
            return note;
        });

        await updateDoc(noteRef, { notes: updatedNotes });

        return res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}