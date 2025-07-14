use crate::{config::COMPASS_BASE_URL, user::get_user_id};
use atem::{AtemUsecase, AtemUsecaseParam};
use lazy_static::lazy_static;
use std::env;

lazy_static! {
    pub static ref ATEM_USECASE: AtemUsecase = AtemUsecase::new(&AtemUsecaseParam {
        base_url: env::var(COMPASS_BASE_URL).unwrap(),
        user: get_user_id().unwrap(),
    });
}
