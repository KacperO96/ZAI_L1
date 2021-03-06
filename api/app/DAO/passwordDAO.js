'use strict'

import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import mongoConverter from '../service/mongoConverter'
import applicationException from "../service/applicationException";
import * as _ from 'lodash';

const passwordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ko_user', required: true, unique: true },
    password: { type: String, required: true }
}, {
    collection: 'password'
});

const PasswordModel = mongoose.model('ko_password', passwordSchema);

async function createOrUpdate(data) {
    const result = await PasswordModel.findOneAndUpdate({ userId: data.userId }, _.omit(data, 'id'), { new: true });
    if (!result) {
        const result = await new PasswordModel({ userId: data.userId, password: data.password }).save();
        if (result) {
            return mongoConverter(result);
        }
    }
    return result;
}

async function authorize(userId, password) {
    const result = await PasswordModel.findOne({ userId: userId, password: password });
    if (result && mongoConverter(result)) {
        return true;
    }
    throw applicationException.new(applicationException.UNAUTHORIZED, 'User and password does not match');
}

export default {
    createOrUpdate: createOrUpdate,
    authorize: authorize,

    model: PasswordModel
};

