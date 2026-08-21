import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class AuthUtil {
    async hashPassword(password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        return hashedPassword;
    };

    async comparePassword(submittedPassword, hashedPassword) {
        const isMatch = await bcrypt.compare(submittedPassword, hashedPassword);

        return isMatch;
    };
}