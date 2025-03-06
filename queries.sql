/*Creating table*/


/*Inserting records*/
INSERT INTO bookslist (author,title,summary,dateread,rating,link,isbn)
VALUES ('Fredrik Backman','Anxious People','"Anxious People" is a hilarious, heartfelt novel about a botched bank robbery, a hostage situation, and a group of strangers who turn out to have more in common than they think.In a small Swedish town, a desperate robber tries to hold up a cashless bank but fails miserably. Panicked, they flee into an apartment during an open house, unknowingly taking a group of quirky hostages. Among them are a bickering couple, a wealthy bank manager, an elderly woman, a pregnant woman, and a mysterious man locked in the bathroom—each dealing with their own anxieties, regrets, and personal struggles.','12-03-2022',9.5,'amazon.com',9781501160844);

/* Sort by ratings */
SELECT * FROM bookslist
ORDER BY rating DESC

/* Sort by latest */
SELECT * FROM bookslist
ORDER BY dateread DESC

/* Sort by title */
SELECT * FROM bookslist
ORDER BY title ASC;