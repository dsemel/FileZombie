const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const argon2 = require("argon2");
const User = require("../models/User");

passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase().trim() });



            if (!user) return done(null, false, { message: "Invalid email or password" });

            const ok = await argon2.verify(user.passwordHash, password);


            if (!ok) return done(null, false, { message: "Invalid email or password" });

            return done(null, user);
        } catch (e) {
            return done(e);
        }
    })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select("_id email");
        done(null, user || false);
    } catch (e) {
        done(e);
    }
});

module.exports = passport;
