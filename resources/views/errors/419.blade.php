@extends('errors.layout')

@section('code', 'Error 419')
@section('title', 'Your session expired')
@section('message', 'The form sat open long enough for your session to time out. Go back and submit it again — nothing has been lost yet.')

@section('secondary')
    <a class="btn ghost" href="{{ url('/login') }}">Sign in again</a>
@endsection
